const mongoose = require('mongoose');
const Player = require('./models/Player');

const rawData = `
SET 1 — MARQUEE SET (Base Price ₹2 Cr)
KL Rahul
Jos Buttler
Rishabh Pant
Shreyas Iyer
Virat Kohli
Rohit Sharma
Shubman Gill
Suryakumar Yadav
Mitchell Starc
Jofra Archer
Kagiso Rabada
Mohammed Shami
Rashid Khan
Glenn Maxwell
Sam Curran
Marcus Stoinis
Hardik Pandya
Ravindra Jadeja

===
SET 2 — ELITE BATTERS (₹1.25 Cr)
Faf du Plessis
David Warner
Devdutt Padikkal
Tilak Varma
Sai Sudharsan
Nitish Rana
Rahul Tripathi
Sarfaraz Khan
Prithvi Shaw
Harry Brook
Ben Duckett
Pathum Nissanka
Matthew Short
Aiden Markram
Ruturaj Gaikwad
Yashasvi Jaiswal

===
SET 3 — POWER FINISHERS / IMPACT BATTERS (₹1 Cr)
Tim David
David Miller
Nicholas Pooran
Heinrich Klaasen
Abdul Samad
Nehal Wadhera
Shubham Dubey
Aniket Verma
Sameer Rizvi
Robin Minz
Ryan Rickelton

===
SET 4 — PREMIUM SPINNERS (₹1 Cr)
Ravi Bishnoi
Kuldeep Yadav
Varun Chakravarthy
Noor Ahmad
Maheesh Theekshana
Adam Zampa
Washington Sundar
Axar Patel
Krunal Pandya
Moeen Ali

===
SET 5 — PREMIUM FAST BOWLERS (₹1 Cr)
Jasprit Bumrah
Bhuvneshwar Kumar
Arshdeep Singh
T Natarajan
Prasidh Krishna
Trent Boult
Anrich Nortje
Lockie Ferguson
Matt Henry
Lungi Ngidi
Kyle Jamieson
Nathan Ellis

===
SET 6 — ALL-ROUNDERS CORE SET (₹75 Lakh)
Mitchell Marsh
Marco Jansen
Romario Shepherd
Azmatullah Omarzai
Raj Angad Bawa
Kamindu Mendis
Vijay Shankar
Deepak Hooda
Rachin Ravindra
Andre Russell
Sunil Narine
Will Jacks

===
SET 7 — WICKETKEEPERS SET (₹75 Lakh)
Ishan Kishan
Sanju Samson
Jitesh Sharma
Josh Inglis
Tim Seifert
Vishnu Vinod
Kumar Kushagra
Dhruv Jurel
Aryan Juyal

===
SET 8 — INDIAN PACERS & SUPPORT BOWLERS (₹50 Lakh)
Harshal Patel
Mukesh Kumar
Mohit Sharma
Akash Deep
Yash Thakur
Shivam Mavi
Tushar Deshpande
Jaydev Unadkat
Kamlesh Nagarkoti
Mukesh Choudhary
Simarjeet Singh
Kulwant Khejroliya
Swapnil Singh

===
SET 9 — DOMESTIC BATTERS & UTILITY PLAYERS (₹40 Lakh)
Sachin Baby
Manish Pandey
Karun Nair
Abhinav Manohar
Priyansh Arya
Ashutosh Sharma
Vansh Bedi
Luvnith Sisodia
Digvesh Singh
Harnoor Pannu
Musheer Khan

===
SET 10 — YOUNG / UNCAPPED TALENT ROUND (₹20 Lakh)
Vaibhav Suryavanshi
Prince Yadav
Naman Dhir
Swastik Chhikara
Shrijith Krishnan
Ashwani Kumar
Rajvardhan Hangargekar
Yuvraj Chaudhary
Anshul Kamboj
Vyshak Vijaykumar
Xavier Bartlett
Aaron Hardie
Gerald Coetzee
Spencer Johnson
Reece Topley
Luke Wood
Brydon Carse

===
SET 11 — ACCELERATED FINAL ROUND (Mixed Left Players)
Kane Williamson
Matthew Breetzke
Donovan Ferreira
Dushmantha Chameera
Vipraj Nigam
Ajay Mandal
Darshan Nalkande
Jayant Yadav
Ishant Sharma
Manav Suthar
Nishant Sindhu
Anukul Roy
Mayank Markande
Rovman Powell
Umran Malik
Mayank Rawat
`;

const parsePrice = (priceStr) => {
    if (priceStr.includes('2 Cr')) return 20000000;
    if (priceStr.includes('1.25 Cr')) return 12500000;
    if (priceStr.includes('1 Cr')) return 10000000;
    if (priceStr.includes('75 Lakh')) return 7500000;
    if (priceStr.includes('50 Lakh')) return 5000000;
    if (priceStr.includes('40 Lakh')) return 4000000;
    if (priceStr.includes('20 Lakh')) return 2000000;
    return 10000000; // default 1Cr for mixed round usually
};

mongoose.connect('mongodb://localhost:27017/ipl-auction')
  .then(async () => {
    console.log('Connected to MongoDB');
    const blocks = rawData.trim().split('===');
    let updatedCount = 0;
    let insertedCount = 0;

    for (let i = 0; i < blocks.length; i++) {
        const lines = blocks[i].trim().split('\n').filter(l => l.trim().length > 0);
        if (lines.length === 0) continue;
        
        const header = lines[0].trim();
        const setNumber = i + 1;
        let setName = header.split('—')[1]?.split('(')[0]?.trim() || ('Set ' + setNumber);
        if (setNumber === 11) setName = "Accelerated Final Round";
        
        let basePrice = parsePrice(header);
        
        const players = lines.slice(1);
        
        for (const playerLine of players) {
            const pName = playerLine.trim();
            if (!pName) continue;
            
            const existing = await Player.findOne({ name: pName });
            if (existing) {
                existing.setNumber = setNumber;
                existing.setName = setName;
                existing.basePrice = basePrice;
                await existing.save();
                updatedCount++;
            } else {
                // Determine overseas roughly
                const isIndian = !['Kane Williamson', 'Matthew Breetzke', 'Donovan Ferreira', 'Dushmantha Chameera', 'Rovman Powell', 'Xavier Bartlett', 'Aaron Hardie', 'Gerald Coetzee', 'Spencer Johnson', 'Reece Topley', 'Luke Wood', 'Brydon Carse', 'Josh Inglis', 'Tim Seifert', 'Mitchell Marsh', 'Marco Jansen', 'Romario Shepherd', 'Azmatullah Omarzai', 'Kamindu Mendis', 'Rachin Ravindra', 'Andre Russell', 'Sunil Narine', 'Will Jacks', 'Lockie Ferguson', 'Matt Henry', 'Lungi Ngidi', 'Kyle Jamieson', 'Nathan Ellis', 'Trent Boult', 'Anrich Nortje', 'Noor Ahmad', 'Maheesh Theekshana', 'Adam Zampa', 'Moeen Ali', 'Tim David', 'David Miller', 'Nicholas Pooran', 'Heinrich Klaasen', 'Ryan Rickelton', 'Faf du Plessis', 'David Warner', 'Harry Brook', 'Ben Duckett', 'Pathum Nissanka', 'Matthew Short', 'Aiden Markram', 'Jos Buttler', 'Mitchell Starc', 'Jofra Archer', 'Kagiso Rabada', 'Rashid Khan', 'Glenn Maxwell', 'Sam Curran', 'Marcus Stoinis'].includes(pName);
                
                await Player.create({
                    name: pName,
                    role: 'ALL',
                    country: isIndian ? 'India' : 'Overseas',
                    isOverseas: !isIndian,
                    iplTeam: 'Unknown',
                    basePrice: basePrice,
                    setNumber: setNumber,
                    setName: setName,
                    status: 'unsold'
                });
                insertedCount++;
            }
        }
    }
    
    console.log('Updated ' + updatedCount + ' players. Inserted ' + insertedCount + ' new players.');
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
