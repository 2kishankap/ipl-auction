const mongoose = require('mongoose');
const Player = require('./models/Player');

const WkList = [
    'KL Rahul', 'Jos Buttler', 'Rishabh Pant', 
    'Ishan Kishan', 'Sanju Samson', 'Jitesh Sharma', 'Josh Inglis', 'Tim Seifert', 'Vishnu Vinod', 'Kumar Kushagra', 'Dhruv Jurel', 'Aryan Juyal',
    'Shrijith Krishnan', 'Matthew Breetzke', 'Donovan Ferreira'
];

const BatList = [
    'Shreyas Iyer', 'Virat Kohli', 'Rohit Sharma', 'Shubman Gill', 'Suryakumar Yadav',
    'Faf du Plessis', 'David Warner', 'Devdutt Padikkal', 'Tilak Varma', 'Sai Sudharsan', 'Nitish Rana', 'Rahul Tripathi', 'Sarfaraz Khan', 'Prithvi Shaw', 'Harry Brook', 'Ben Duckett', 'Pathum Nissanka', 'Matthew Short', 'Aiden Markram', 'Ruturaj Gaikwad', 'Yashasvi Jaiswal',
    'Tim David', 'David Miller', 'Nicholas Pooran', 'Heinrich Klaasen', 'Abdul Samad', 'Nehal Wadhera', 'Shubham Dubey', 'Aniket Verma', 'Sameer Rizvi', 'Robin Minz', 'Ryan Rickelton',
    'Sachin Baby', 'Manish Pandey', 'Karun Nair', 'Abhinav Manohar', 'Priyansh Arya', 'Ashutosh Sharma', 'Vansh Bedi', 'Luvnith Sisodia', 'Digvesh Singh', 'Harnoor Pannu', 'Musheer Khan',
    'Vaibhav Suryavanshi', 'Swastik Chhikara', 'Kane Williamson', 'Rovman Powell'
];

const BowlList = [
    'Mitchell Starc', 'Jofra Archer', 'Kagiso Rabada', 'Mohammed Shami', 'Rashid Khan',
    'Ravi Bishnoi', 'Kuldeep Yadav', 'Varun Chakravarthy', 'Noor Ahmad', 'Maheesh Theekshana', 'Adam Zampa', 'Washington Sundar', 'Axar Patel', 'Krunal Pandya', 'Moeen Ali',
    'Jasprit Bumrah', 'Bhuvneshwar Kumar', 'Arshdeep Singh', 'T Natarajan', 'Prasidh Krishna', 'Trent Boult', 'Anrich Nortje', 'Lockie Ferguson', 'Matt Henry', 'Lungi Ngidi', 'Kyle Jamieson', 'Nathan Ellis',
    'Harshal Patel', 'Mukesh Kumar', 'Mohit Sharma', 'Akash Deep', 'Yash Thakur', 'Shivam Mavi', 'Tushar Deshpande', 'Jaydev Unadkat', 'Kamlesh Nagarkoti', 'Mukesh Choudhary', 'Simarjeet Singh', 'Kulwant Khejroliya', 'Swapnil Singh',
    'Ashwani Kumar', 'Anshul Kamboj', 'Vyshak Vijaykumar', 'Xavier Bartlett', 'Gerald Coetzee', 'Spencer Johnson', 'Reece Topley', 'Luke Wood', 'Brydon Carse',
    'Dushmantha Chameera', 'Vipraj Nigam', 'Darshan Nalkande', 'Ishant Sharma', 'Manav Suthar', 'Mayank Markande', 'Umran Malik'
];

const AllList = [
    'Glenn Maxwell', 'Sam Curran', 'Marcus Stoinis', 'Hardik Pandya', 'Ravindra Jadeja',
    'Mitchell Marsh', 'Marco Jansen', 'Romario Shepherd', 'Azmatullah Omarzai', 'Raj Angad Bawa', 'Kamindu Mendis', 'Vijay Shankar', 'Deepak Hooda', 'Rachin Ravindra', 'Andre Russell', 'Sunil Narine', 'Will Jacks',
    'Prince Yadav', 'Naman Dhir', 'Rajvardhan Hangargekar', 'Yuvraj Chaudhary', 'Aaron Hardie',
    'Ajay Mandal', 'Jayant Yadav', 'Nishant Sindhu', 'Anukul Roy', 'Mayank Rawat'
];

mongoose.connect('mongodb://localhost:27017/ipl-auction')
  .then(async () => {
    console.log('Connected to DB');
    let modifications = 0;
    
    const players = await Player.find({});
    
    for (const p of players) {
        let newRole = p.role;
        
        if (WkList.includes(p.name)) newRole = 'WK';
        else if (BatList.includes(p.name)) newRole = 'BAT';
        else if (BowlList.includes(p.name)) newRole = 'BOWL';
        else if (AllList.includes(p.name)) newRole = 'ALL';
        else {
             // Fallbacks for set categories if name isn't precisely matched in explicitly mapped array
             if ([2, 3, 9].includes(p.setNumber)) newRole = 'BAT';
             else if ([4, 5, 8].includes(p.setNumber)) newRole = 'BOWL';
             else if (p.setNumber === 6) newRole = 'ALL';
             else if (p.setNumber === 7) newRole = 'WK';
        }

        if (p.role !== newRole) {
            p.role = newRole;
            await p.save();
            modifications++;
        }
    }

    console.log(`Successfully mapped and patched ${modifications} incorrect player demographic roles!`);
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
