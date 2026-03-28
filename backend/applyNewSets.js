const mongoose = require('mongoose');
const Player = require('./models/Player');

const rawData = `
SET 1 — MARQUEE SUPERSTARS
Virat Kohli – RCB
Rohit Sharma – MI
Shubman Gill – GT
Rishabh Pant – LSG
KL Rahul – DC
Jos Buttler – GT
Sanju Samson – CSK
Ishan Kishan – SRH
Suryakumar Yadav – MI
Tilak Varma – MI
Ruturaj Gaikwad – CSK
Shreyas Iyer – PBKS
Travis Head – SRH
Nicholas Pooran – LSG
Heinrich Klaasen – SRH
Tim David – RCB
David Miller – DC
Rashid Khan – GT
Sunil Narine – KKR
Hardik Pandya – MI
Ravindra Jadeja – RR
Marcus Stoinis – PBKS
Mitchell Starc – DC
Jasprit Bumrah – MI

SET 2 — ELITE BATTERS & WICKETKEEPERS
Devdutt Padikkal – RCB
Sai Sudharsan – GT
Nitish Rana – DC
Rahul Tripathi – KKR
Sarfaraz Khan – CSK
Prithvi Shaw – DC
Ben Duckett – DC
Pathum Nissanka – DC
Matthew Short – CSK
Ajinkya Rahane – KKR
Manish Pandey – KKR
Rinku Singh – KKR
Angkrish Raghuvanshi – KKR
Nehal Wadhera – PBKS
Priyansh Arya – PBKS
Karun Nair – DC
Himmat Singh – LSG
Aniket Verma – SRH
Shubham Dubey – RR
Naman Dhir – MI
Ryan Rickelton – MI
Robin Minz – MI
Dhruv Jurel – RR
Philip Salt – RCB
Josh Inglis – LSG

SET 3 — ELITE FAST BOWLERS
Mohammed Shami – LSG
Arshdeep Singh – PBKS
Bhuvneshwar Kumar – RCB
T Natarajan – DC
Trent Boult – MI
Kagiso Rabada – GT
Anrich Nortje – LSG
Lockie Ferguson – PBKS
Matt Henry – CSK
Kyle Jamieson – DC
Lungi Ngidi – DC
Pat Cummins – SRH
Jofra Archer – RR
Prasidh Krishna – GT
Mukesh Kumar – DC
Deepak Chahar – MI
Harshal Patel – SRH
Avesh Khan – LSG
Umran Malik – KKR
Vaibhav Arora – KKR
Kartik Tyagi – KKR
Yash Thakur – PBKS
Shivam Mavi – SRH
Tushar Deshpande – RR
Mohsin Khan – LSG

SET 4 — ELITE SPINNERS
Kuldeep Yadav – DC
Ravi Bishnoi – RR
Varun Chakravarthy – KKR
Noor Ahmad – CSK
Maheesh Theekshana – (from your earlier list pool logic)
Adam Zampa – (from pool)
Yuzvendra Chahal – PBKS
Washington Sundar – GT
Sai Kishore – GT
Krunal Pandya – RCB
Mitchell Santner – MI
Wanindu Hasaranga – LSG
Shreyas Gopal – CSK
Prashant Solanki – KKR
Vicky Ostwal – RCB
Jayant Yadav – GT
Manimaran Siddharth – LSG
Mayank Markande – MI
Raghu Sharma – MI
Harpreet Brar – PBKS
Swapnil Singh – RCB
Anukul Roy – KKR

SET 5 — ELITE ALL-ROUNDERS
Mitchell Marsh – LSG
Cameron Green – KKR
Marco Jansen – PBKS
Rachin Ravindra – KKR
Liam Livingstone – SRH
Sunil Narine – KKR (if not bought earlier in marquee logic)
Andre Russell – (pool logic superstar allrounder)
Riyan Parag – RR
Shardul Thakur – MI
Romario Shepherd – RCB
Azmatullah Omarzai – PBKS
Jason Holder – GT
Shivam Dube – CSK
Abhishek Sharma – SRH
Nitish Kumar Reddy – SRH
Rahul Tewatia – GT
Raj Bawa – MI
Will Jacks – MI
Ayush Badoni – LSG
Shahbaz Ahmed – LSG
Arjun Tendulkar – LSG
Cooper Connolly – PBKS
Musheer Khan – PBKS
Mitchell Owen – PBKS
Kamindu Mendis – SRH

SET 6 — INDIAN CORE UTILITY PLAYERS
Ajay Mandal – DC
Ashutosh Sharma – DC
Madhav Tiwari – DC
Tripurana Vijay – DC
Auqib Nabi Dar – DC
Shahrukh Khan – GT
Nishant Sindhu – GT
Manav Suthar – GT
Arshad Khan – GT
Praveen Dubey – PBKS
Shashank Singh – PBKS
Ramandeep Singh – KKR
Daksh Kamra – KKR
Sarthak Ranjan – KKR
Anshul Kamboj – CSK
Ramakrishna Ghosh – CSK
Harsh Dubey – SRH
Shivang Kumar – SRH
Mayank Rawat – MI
Atharva Ankolekar – MI
Corbin Bosch – MI
Raj Bawa – MI
Arshin Kulkarni – LSG
Akshat Raghuwanshi – LSG
Himmat Singh – LSG

SET 7 — YOUNG / UNCAPPED MEGA ROUND
Ayush Mhatre – CSK
Urvil Patel – CSK
Kartik Sharma – CSK
Gurjapneet Singh – CSK
Prashant Veer – CSK
Sahil Parakh – DC
Vipraj Nigam – DC
Gurnoor Brar – GT
Ashok Sharma – GT
Prithvi Raj Yarra – GT
Vihaan Malhotra – RCB
Mangesh Yadav – RCB
Kanishk Chouhan – RCB
Satvik Deswal – RCB
Abhinandan Singh – RCB
Jacob Duffy – RCB
Priyansh Arya – PBKS
Pyla Avinash – PBKS
Harnoor Singh – PBKS
Suryansh Shedge – PBKS
Tejasvi Dahiya – KKR
Blessing Muzarabani – KKR
Smaran Ravichandran – SRH
Salil Arora – SRH
Zeeshan Ansari – SRH
Sakib Hussain – SRH
Onkar Tarmale – SRH
Amit Kumar – SRH
Praful Hinge – SRH
Krains Fuletra – SRH

SET 8 — ACCELERATED FINAL ROUND
Jamie Overton – CSK
Zakary Foulkes – CSK
Akeal Hosein – CSK
Dushmantha Chameera – DC
Ben Dwarshuis – PBKS
Vishal Nishad – PBKS
Nandre Burger – RR
Kwena Maphaka – RR
Yudhvir Singh – RR
Vignesh Puthur – RR
Yash Raj Punja – RR
Sushant Mishra – RR
Brijesh Sharma – RR
Adam Milne – RR
Akash Maharaj Singh – LSG
Prince Yadav – LSG
Digvesh Singh – LSG
Mayank Yadav – LSG
Naman Tiwari – LSG
AM Ghazanfar – MI
Ashwani Kumar – MI
Mohammed Izhar – MI
`;

mongoose.connect('mongodb://localhost:27017/ipl-auction')
  .then(async () => {
    console.log('Connected to MongoDB');
    
    // First, push all players to a default set to clear their current set assignment
    await Player.updateMany({}, { setNumber: 99, setName: 'UNCATEGORIZED / UNSOLD POOL' });
    console.log('All players moved to Set 99 initially.');

    const blocks = rawData.split('SET ').filter(b => b.trim().length > 0);
    
    let updatedCount = 0;
    
    for (const block of blocks) {
        const lines = block.trim().split('\n').map(l => l.trim()).filter(l => l.length > 0);
        if (lines.length === 0) continue;
        
        // Parse header: e.g "1 — MARQUEE SUPERSTARS"
        const headerMatch = lines[0].match(/^(\d+)\s*[—\-]\s*(.*)$/);
        if (!headerMatch) continue;
        
        const setNumber = parseInt(headerMatch[1], 10);
        const setName = headerMatch[2].trim();
        
        for (let i = 1; i < lines.length; i++) {
            let pName = lines[i];
            
            // Clean up annotations like " – RCB" or " (from pool)"
            pName = pName.split('–')[0].split('-')[0].split('(')[0].trim();
            
            // Search and update the player
            // Using a case-insensitive regex for robust matching
            const existing = await Player.find({ name: { $regex: new RegExp(pName, 'i') } });
            
            if (existing && existing.length > 0) {
                // To avoid multiple matches, we can just update the first one or try exact match first
                const target = existing.find(e => e.name.toLowerCase() === pName.toLowerCase()) || existing[0];
                target.setNumber = setNumber;
                target.setName = setName;
                await target.save();
                updatedCount++;
            } else {
                console.log(`Warning: Player not found in DB: "${pName}"`);
                // Could create, but the user implies they are in the DB. Let's just create placeholder if missed
                await Player.create({
                    name: pName,
                    role: 'ALL',
                    country: 'Unknown',
                    isOverseas: false,
                    iplTeam: 'Unknown',
                    basePrice: 2000000, // default 20L
                    setNumber: setNumber,
                    setName: setName,
                    status: 'unsold'
                });
                console.log(`Created placeholder for missing player: ${pName}`);
            }
        }
    }
    
    console.log(`Reorganization complete! Processed ${updatedCount} existing players.`);
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
