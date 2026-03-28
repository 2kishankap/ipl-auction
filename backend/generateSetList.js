const mongoose = require('mongoose');
const fs = require('fs');
const Player = require('./models/Player');

mongoose.connect('mongodb://localhost:27017/ipl-auction')
  .then(async () => {
    const players = await Player.find().sort({ setNumber: 1, basePrice: -1 });
    
    const sets = {};
    for (const p of players) {
        if (!sets[p.setNumber]) {
            sets[p.setNumber] = { name: p.setName, players: [] };
        }
        sets[p.setNumber].players.push(p);
    }
    
    let md = '# IPL Auction - Players by Set\n\n';
    
    for (const num of Object.keys(sets).sort((a,b)=>Number(a)-Number(b))) {
        md += `## Set ${num}: ${sets[num].name}\n`;
        md += `| Player Name | Role | Country | Base Price | Status |\n`;
        md += `|---|---|---|---|---|\n`;
        for (const p of sets[num].players) {
            const price = p.basePrice >= 10000000 
                ? `₹${(p.basePrice / 10000000).toFixed(2).replace(/\.00$/, '')} Cr`
                : `₹${(p.basePrice / 100000).toFixed(0)} Lakh`;
            md += `| ${p.name} | ${p.role} | ${p.country} | ${price} | ${p.status.toUpperCase()} |\n`;
        }
        md += '\n';
    }
    
    fs.writeFileSync('/Users/venkatakishan/.gemini/antigravity/brain/9bc50deb-ef29-45c4-987a-d00a94ef33d7/players_by_set.md', md);
    console.log('Markdown generated to artifact directory.');
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
