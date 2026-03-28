const mongoose = require('mongoose');
require('dotenv').config();
const Player = require('./models/Player');
const Team = require('./models/Team');
const Auction = require('./models/Auction');

// ── 8 Custom Teams with auction results ──
const teamsData = [
  {
    teamName: 'Pavan Reddy',
    ownerName: 'Jai Hind',
    totalSpent: 99.05,
    purseLeft: 0.95,
    players: [
      { name: 'Jos Buttler', soldPrice: 13.00 },
      { name: 'Virat Kohli', soldPrice: 26.00 },
      { name: 'Angkrish Raghuvanshi', soldPrice: 8.00 },
      { name: 'Kyle Jamieson', soldPrice: 1.00 },
      { name: 'Bhuvneshwar Kumar', soldPrice: 4.75 },
      { name: 'T Natarajan', soldPrice: 2.00 },
      { name: 'Ravi Bishnoi', soldPrice: 6.50 },
      { name: 'Mitchell Santner', soldPrice: 3.25 },
      { name: 'Riyan Parag', soldPrice: 9.00 },
      { name: 'Shardul Thakur', soldPrice: 3.25 },
      { name: 'Mitchell Marsh', soldPrice: 8.00 },
      { name: 'Priyansh Arya', soldPrice: 3.25 },
      { name: 'Aiden Markram', soldPrice: 2.65 },
      { name: 'Finn Allen', soldPrice: 3.00 },
      { name: 'Khaleel Ahmed', soldPrice: 2.00 },
      { name: 'Mohammed Siraj', soldPrice: 2.40 },
      { name: 'Rahul Chahar', soldPrice: 0.50 },
      { name: 'Shivam Mavi', soldPrice: 0.50 },
    ]
  },
  {
    teamName: 'Kishan dd',
    ownerName: 'sdvsdv',
    totalSpent: 99.25,
    purseLeft: 0.75,
    players: [
      { name: 'Travis Head', soldPrice: 16.00 },
      { name: 'Rishabh Pant', soldPrice: 16.00 },
      { name: 'Marcus Stoinis', soldPrice: 9.50 },
      { name: 'Suryakumar Yadav', soldPrice: 16.00 },
      { name: 'Dhruv Jurel', soldPrice: 5.50 },
      { name: 'Nitish Rana', soldPrice: 1.45 },
      { name: 'Trent Boult', soldPrice: 6.50 },
      { name: 'Harshal Patel', soldPrice: 3.75 },
      { name: 'Mukesh Kumar', soldPrice: 0.85 },
      { name: 'Vaibhav Arora', soldPrice: 1.70 },
      { name: 'Yuzvendra Chahal', soldPrice: 8.50 },
      { name: 'Jitesh Sharma', soldPrice: 2.80 },
      { name: 'Dewald Brevis', soldPrice: 8.00 },
      { name: 'Suyash Sharma', soldPrice: 0.50 },
      { name: 'Sandeep Sharma', soldPrice: 2.00 },
      { name: 'Luke Wood', soldPrice: 0.20 },
    ]
  },
  {
    teamName: 'Sri Harsha',
    ownerName: 'Dallas Kings',
    totalSpent: 83.10,
    purseLeft: 16.90,
    players: [
      { name: 'Sai Sudharsan', soldPrice: 12.05 },
      { name: 'Ravisrinivasan Sai Kishore', soldPrice: 4.75 },
      { name: 'Varun Chakaravarthy', soldPrice: 9.50 },
      { name: 'Nitish Kumar Reddy', soldPrice: 8.00 },
      { name: 'Cameron Green', soldPrice: 11.00 },
      { name: 'Liam Livingstone', soldPrice: 5.50 },
      { name: 'Will Jacks', soldPrice: 3.25 },
      { name: 'Urvil Patel', soldPrice: 2.00 },
      { name: 'Kartik Sharma', soldPrice: 0.80 },
      { name: 'Digvesh Singh Rathi', soldPrice: 2.60 },
      { name: 'Mayank Yadav', soldPrice: 0.85 },
      { name: 'Quinton de Kock', soldPrice: 3.00 },
      { name: 'Rajat Patidar', soldPrice: 4.00 },
      { name: 'Jacob Bethell', soldPrice: 3.00 },
      { name: 'Yashasvi Jaiswal', soldPrice: 7.55 },
      { name: 'Axar Patel', soldPrice: 1.00 },
      { name: 'Vijaykumar Vyshak', soldPrice: 3.25 },
      { name: 'Lockie Ferguson', soldPrice: 1.00 },
    ]
  },
  {
    teamName: 'Bharath Reddy',
    ownerName: 'Gym',
    totalSpent: 99.70,
    purseLeft: 0.30,
    players: [
      { name: 'Shreyas Iyer', soldPrice: 18.00 },
      { name: 'David Miller', soldPrice: 7.00 },
      { name: 'Tim David', soldPrice: 5.00 },
      { name: 'Nicholas Pooran', soldPrice: 12.00 },
      { name: 'Ruturaj Gaikwad', soldPrice: 16.05 },
      { name: 'Prithvi Shaw', soldPrice: 2.00 },
      { name: 'Nehal Wadhera', soldPrice: 7.00 },
      { name: 'Ajinkya Rahane', soldPrice: 5.50 },
      { name: 'Prasidh Krishna', soldPrice: 5.00 },
      { name: 'Tushar Deshpande', soldPrice: 0.55 },
      { name: 'Deepak Chahar', soldPrice: 2.40 },
      { name: 'Noor Ahmad', soldPrice: 8.00 },
      { name: 'Sunil Narine', soldPrice: 4.00 },
      { name: 'M Shahrukh Khan', soldPrice: 2.20 },
      { name: 'Lhuan-dre Pretorius', soldPrice: 2.00 },
      { name: 'Sherfane Rutherford', soldPrice: 1.00 },
      { name: 'Harsh Dubey', soldPrice: 2.00 },
    ]
  },
  {
    teamName: 'Ranjith Reddy',
    ownerName: 'mama',
    totalSpent: 95.20,
    purseLeft: 4.80,
    players: [
      { name: 'Rohit Sharma', soldPrice: 15.50 },
      { name: 'Shubman Gill', soldPrice: 18.00 },
      { name: 'Philip Salt', soldPrice: 10.50 },
      { name: 'Arshdeep Singh', soldPrice: 7.50 },
      { name: 'Avesh Khan', soldPrice: 2.40 },
      { name: 'Mayank Markande', soldPrice: 1.00 },
      { name: 'Kuldeep Yadav', soldPrice: 5.00 },
      { name: 'Shahbaz Ahmed', soldPrice: 2.00 },
      { name: 'Jason Holder', soldPrice: 2.60 },
      { name: 'Auqib Nabi Dar', soldPrice: 4.50 },
      { name: 'Shashank Singh', soldPrice: 2.80 },
      { name: 'Salil Arora', soldPrice: 3.75 },
      { name: 'Jacob Duffy', soldPrice: 3.00 },
      { name: 'Prashant Veer', soldPrice: 3.00 },
      { name: 'Akeal Hosein', soldPrice: 1.00 },
      { name: 'Vaibhav Sooryavanshi', soldPrice: 9.50 },
      { name: 'Tim Seifert', soldPrice: 0.75 },
      { name: 'Jaydev Unadkat', soldPrice: 2.40 },
    ]
  },
  {
    teamName: 'Chintu',
    ownerName: 'Chintu',
    totalSpent: 99.20,
    purseLeft: 0.80,
    players: [
      { name: 'Hardik Pandya', soldPrice: 19.50 },
      { name: 'Tilak Varma', soldPrice: 14.55 },
      { name: 'Sanju Samson', soldPrice: 22.00 },
      { name: 'Pathum Nissanka', soldPrice: 1.55 },
      { name: 'Mohammed Shami', soldPrice: 6.50 },
      { name: 'Lungi Ngidi', soldPrice: 2.00 },
      { name: 'Kartik Tyagi', soldPrice: 2.00 },
      { name: 'Wanindu Hasaranga', soldPrice: 1.10 },
      { name: 'Romario Shepherd', soldPrice: 5.00 },
      { name: 'Marco Jansen', soldPrice: 5.50 },
      { name: 'Ayush Mhatre', soldPrice: 4.50 },
      { name: 'Zeeshan Ansari', soldPrice: 3.00 },
      { name: 'Prabhsimran Singh', soldPrice: 8.00 },
      { name: 'Shimron Hetmyer', soldPrice: 3.00 },
      { name: 'Ishant Sharma', soldPrice: 1.00 },
    ]
  },
  {
    teamName: 'Litin Tillu',
    ownerName: 'Tillu',
    totalSpent: 99.60,
    purseLeft: 0.40,
    players: [
      { name: 'Rashid Khan', soldPrice: 11.00 },
      { name: 'Mitchell Starc', soldPrice: 8.00 },
      { name: 'Jasprit Bumrah', soldPrice: 13.50 },
      { name: 'Heinrich Klaasen', soldPrice: 13.00 },
      { name: 'Ravindra Jadeja', soldPrice: 13.50 },
      { name: 'Karun Nair', soldPrice: 3.00 },
      { name: 'Naman Dhir', soldPrice: 0.60 },
      { name: 'Manish Pandey', soldPrice: 2.60 },
      { name: 'Rahul Tripathi', soldPrice: 2.05 },
      { name: 'Sarfaraz Khan', soldPrice: 1.65 },
      { name: 'Anrich Nortje', soldPrice: 2.80 },
      { name: 'Krunal Pandya', soldPrice: 6.00 },
      { name: 'Abhishek Sharma', soldPrice: 19.00 },
      { name: 'Yash Thakur', soldPrice: 0.50 },
      { name: 'Musheer Khan', soldPrice: 0.40 },
      { name: 'Rahul Tewatia', soldPrice: 2.00 },
    ]
  },
  {
    teamName: 'Gunda',
    ownerName: 'DP',
    totalSpent: 95.80,
    purseLeft: 4.20,
    players: [
      { name: 'KL Rahul', soldPrice: 19.50 },
      { name: 'Ishan Kishan', soldPrice: 18.50 },
      { name: 'Rinku Singh', soldPrice: 7.00 },
      { name: 'Josh Inglis', soldPrice: 0.75 },
      { name: 'Ryan Rickelton', soldPrice: 1.40 },
      { name: 'Devdutt Padikkal', soldPrice: 7.05 },
      { name: 'Jofra Archer', soldPrice: 7.00 },
      { name: 'Kagiso Rabada', soldPrice: 5.50 },
      { name: 'Matt Henry', soldPrice: 3.00 },
      { name: 'Washington Sundar', soldPrice: 4.75 },
      { name: 'Harpreet Brar', soldPrice: 0.60 },
      { name: 'Shivam Dube', soldPrice: 11.50 },
      { name: 'Ayush Badoni', soldPrice: 2.00 },
      { name: 'Rachin Ravindra', soldPrice: 0.85 },
      { name: 'Abishek Porel', soldPrice: 3.00 },
      { name: 'Venkatesh Iyer', soldPrice: 2.40 },
      { name: 'Aniket Verma', soldPrice: 1.00 },
    ]
  }
];

async function restore() {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/ipl-auction');
  console.log('Connected to MongoDB\n');

  // ── Step 1: Clean up the incorrectly created IPL franchise teams ──
  console.log('── STEP 1: Cleaning up old incorrect data ──');
  const deletedTeams = await Team.deleteMany({});
  console.log(`   Deleted ${deletedTeams.deletedCount} old teams`);

  // Reset all players back to master template state
  const resetResult = await Player.updateMany(
    {},
    { $set: { status: 'unsold', soldPrice: null, soldToTeamId: null, auctionId: null } }
  );
  console.log(`   Reset ${resetResult.modifiedCount} players to unsold\n`);

  // ── Step 2: Create a new "Demo" auction ──
  console.log('── STEP 2: Creating new Demo auction ──');
  const demoAuction = new Auction({
    name: 'Demo',
    status: 'COMPLETED',
    phase: 'LEAGUE_MODE',
    purseLimit: 1000000000, // 100 Cr
    squadLimit: 25
  });
  await demoAuction.save();
  console.log(`   ✅ Created auction: "${demoAuction.name}" (${demoAuction._id})\n`);

  const auctionId = demoAuction._id;

  // ── Step 3: Clone all 245 master players for this auction ──
  console.log('── STEP 3: Cloning players for auction ──');
  const masterPlayers = await Player.find({ auctionId: null });
  console.log(`   Found ${masterPlayers.length} master template players`);

  // Build a name->clonedPlayer map for linking later
  const playerNameMap = {};

  for (const mp of masterPlayers) {
    const clone = new Player({
      name: mp.name,
      role: mp.role,
      country: mp.country,
      isOverseas: mp.isOverseas,
      iplTeam: mp.iplTeam,
      basePrice: mp.basePrice,
      setNumber: mp.setNumber,
      setName: mp.setName,
      status: 'unsold',
      auctionId: auctionId,
    });
    await clone.save();
    // Store by lowercase name for flexible matching
    playerNameMap[mp.name.toLowerCase()] = clone;
  }
  console.log(`   ✅ Cloned ${Object.keys(playerNameMap).length} players\n`);

  // ── Step 4: Create 8 teams and link sold players ──
  console.log('── STEP 4: Creating teams and linking sold players ──');
  let totalSold = 0;
  const notFound = [];

  for (const td of teamsData) {
    const purseRemaining = td.purseLeft * 10000000; // Convert Cr to raw number

    const team = new Team({
      teamName: td.teamName,
      ownerName: td.ownerName,
      auctionId: auctionId,
      purseRemaining: purseRemaining,
      playersBought: [],
      overseasCount: 0,
    });
    await team.save();

    const boughtIds = [];
    for (const pd of td.players) {
      const key = pd.name.toLowerCase();
      // Try exact match first, then fuzzy
      let clone = playerNameMap[key];

      // Handle known mismatches
      if (!clone && key === 'varun chakravarthy') clone = playerNameMap['varun chakaravarthy'];
      if (!clone && key === 'quinton de kock') clone = playerNameMap['quinton de kock'];
      if (!clone && key === 'mayank yadav') clone = playerNameMap['mayank prabhu yadav'];
      if (!clone && key === 'prithvi shaw') {
        // Prithvi Shaw might not be in the 245 DB - create him
        const newPlayer = new Player({
          name: 'Prithvi Shaw',
          role: 'BAT',
          country: 'India',
          isOverseas: false,
          iplTeam: 'Unknown',
          basePrice: pd.soldPrice * 10000000,
          setNumber: 99,
          setName: 'Uncategorized',
          status: 'unsold',
          auctionId: auctionId,
        });
        await newPlayer.save();
        clone = newPlayer;
        playerNameMap[key] = clone;
      }

      if (clone) {
        await Player.updateOne({ _id: clone._id }, {
          $set: {
            status: 'sold',
            soldToTeamId: team._id,
            soldPrice: pd.soldPrice * 10000000, // Convert Cr to raw
          }
        });
        boughtIds.push(clone._id);
        totalSold++;
      } else {
        notFound.push(`${pd.name} (${td.teamName})`);
      }
    }

    await Team.updateOne({ _id: team._id }, { $set: { playersBought: boughtIds } });
    console.log(`   ✅ ${td.teamName} (${td.ownerName}) → ${boughtIds.length}/${td.players.length} players linked`);
  }

  console.log(`\n${'═'.repeat(55)}`);
  console.log(`   ✅ New auction "${demoAuction.name}" created: ${demoAuction._id}`);
  console.log(`   ✅ 8 teams created`);
  console.log(`   ✅ ${totalSold} players sold & linked`);
  if (notFound.length > 0) {
    console.log(`   ⚠️  ${notFound.length} players not found:`);
    notFound.forEach(n => console.log(`      - ${n}`));
  }
  console.log(`${'═'.repeat(55)}\n`);

  await mongoose.disconnect();
}

restore().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
