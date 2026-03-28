const fs = require('fs');

const rawText = `
CSK 

BATTERS
ruturaj-gaikwad
Ruturaj Gaikwad (Captain)
Batsman

dewald-brevis
Dewald Brevis
Batsman

ayush-mhatre
Ayush Mhatre
Batsman

matthew-short
Matthew Short
Batsman

sarfaraz-khan
Sarfaraz Khan
Batsman

ALL ROUNDERS
shivam-dube
Shivam Dube
Batting Allrounder

ramakrishna-ghosh
Ramakrishna Ghosh
Batting Allrounder

jamie-overton
Jamie Overton
Bowling Allrounder

anshul-kamboj
Anshul Kamboj
Bowling Allrounder

zakary-foulkes
Zakary Foulkes
Bowling Allrounder

WICKET KEEPERS
ms-dhoni
MS Dhoni
WK-Batsman

urvil-patel
Urvil Patel
WK-Batsman

sanju-samson
Sanju Samson
WK-Batsman

kartik-sharma
Kartik Sharma
WK-Batsman

BOWLERS
shreyas-gopal
Shreyas Gopal
Bowler

khaleel-ahmed
Khaleel Ahmed
Bowler

gurjapneet-singh
Gurjapneet Singh
Bowler

mukesh-choudhary
Mukesh Choudhary
Bowler

noor-ahmad
Noor Ahmad
Bowler

prashant-veer
Prashant Veer
Bowler

akeal-hosein
Akeal Hosein
Bowler

matt-henry
Matt Henry
Bowler

rahul-chahar
Rahul Chahar
Bowler

DC
BATTERS
karun-nair
Karun Nair
Batsman

nitish-rana
Nitish Rana
Batsman

sameer-rizvi
Sameer Rizvi
Batsman

david-miller
David Miller
Batsman

ben-duckett
Ben Duckett
Batsman

pathum-nissanka
Pathum Nissanka
Batsman

sahil-parakh
Sahil Parakh
Batsman

ALL ROUNDERS
ashutosh-sharma
Ashutosh Sharma
Batting Allrounder

axar-patel
Axar Patel (Captain)
Bowling Allrounder

ajay-jadav-mandal
Ajay Jadav Mandal
Bowling Allrounder

madhav-tiwari
Madhav Tiwari
Bowling Allrounder

tripurana-vijay
Tripurana Vijay
Bowling Allrounder

auqib-nabi-dar
Auqib Nabi Dar
Bowling Allrounder

WICKET KEEPERS
abishek-porel
Abishek Porel
WK-Batsman

kl-rahul
KL Rahul
WK-Batsman

tristan-stubbs
Tristan Stubbs
WK-Batsman

BOWLERS
dushmantha-chameera
Dushmantha Chameera
Bowler

kuldeep-yadav
Kuldeep Yadav
Bowler

mukesh-kumar
Mukesh Kumar
Bowler

t-natarajan
T Natarajan
Bowler

vipraj-nigam
Vipraj Nigam
Bowler

mitchell-starc
Mitchell Starc
Bowler

lungi-ngidi
Lungi Ngidi
Bowler

kyle-jamieson
Kyle Jamieson
Bowler

GT
BATTERS
shubman-gill
Shubman Gill (Captain)
Batsman

m-shahrukh-khan
M Shahrukh Khan
Batsman

sai-sudharsan
Sai Sudharsan
Batsman

ALL ROUNDERS
nishant-sindhu
Nishant Sindhu
Batting Allrounder

rashid-khan
Rashid Khan
Bowling Allrounder

manav-suthar
Manav Suthar
Bowling Allrounder

rahul-tewatia
Rahul Tewatia
Bowling Allrounder

washington-sundar
Washington Sundar
Bowling Allrounder

arshad-khan
Arshad Khan
Bowling Allrounder

ravisrinivasan-sai-kishore
Ravisrinivasan Sai Kishore
Bowling Allrounder

jason-holder
Jason Holder
Bowling Allrounder

WICKET KEEPERS
anuj-rawat
Anuj Rawat
WK-Batsman

jos-buttler
Jos Buttler
WK-Batsman

kumar-kushagra
Kumar Kushagra
WK-Batsman

glenn-phillips
Glenn Phillips
WK-Batsman

tom-banton
Tom Banton
WK-Batsman

BOWLERS
gurnoor-brar
Gurnoor Brar
Bowler

mohammed-siraj
Mohammed Siraj
Bowler

prasidh-krishna
Prasidh Krishna
Bowler

kagiso-rabada
Kagiso Rabada
Bowler

jayant-yadav
Jayant Yadav
Bowler

ishant-sharma
Ishant Sharma
Bowler

ashok-sharma
Ashok Sharma
Bowler

prithvi-raj-yarra
Prithvi Raj Yarra
Bowler

luke-wood
Luke Wood
Bowler

RCB
BATTERS
rajat-patidar
Rajat Patidar (Captain)
Batsman

tim-david
Tim David
Batsman

virat-kohli
Virat Kohli
Batsman

devdutt-padikkal
Devdutt Padikkal
Batsman

ALL ROUNDERS
jacob-bethell
Jacob Bethell
Batting Allrounder

krunal-pandya
Krunal Pandya
Batting Allrounder

venkatesh-iyer
Venkatesh Iyer
Batting Allrounder

vihaan-malhotra
Vihaan Malhotra
Batting Allrounder

romario-shepherd
Romario Shepherd
Bowling Allrounder

mangesh-yadav
Mangesh Yadav
Bowling Allrounder

kanishk-chouhan
Kanishk Chouhan
Bowling Allrounder

satvik-deswal
Satvik Deswal
Bowling Allrounder

WICKET KEEPERS
philip-salt
Philip Salt
WK-Batsman

jitesh-sharma
Jitesh Sharma
WK-Batsman

jordan-cox
Jordan Cox
WK-Batsman

BOWLERS
abhinandan-singh
Abhinandan Singh
Bowler

josh-hazlewood
Josh Hazlewood
Bowler

rasikh-salam-dar
Rasikh Salam Dar
Bowler

bhuvneshwar-kumar
Bhuvneshwar Kumar
Bowler

suyash-sharma
Suyash Sharma
Bowler

swapnil-singh
Swapnil Singh
Bowler

yash-dayal
Yash Dayal
Bowler

nuwan-thushara
Nuwan Thushara
Bowler

jacob-duffy
Jacob Duffy
Bowler

vicky-ostwal
Vicky Ostwal
Bowler

PK
BATTERS
shreyas-iyer
Shreyas Iyer (Captain)
Batsman

priyansh-arya
Priyansh Arya
Batsman

pyla-avinash
Pyla Avinash
Batsman

harnoor-singh
Harnoor Singh
Batsman

nehal-wadhera
Nehal Wadhera
Batsman

ALL ROUNDERS
mitchell-owen
Mitchell Owen
Batting Allrounder

musheer-khan
Musheer Khan
Batting Allrounder

shashank-singh
Shashank Singh
Batting Allrounder

marcus-stoinis
Marcus Stoinis
Batting Allrounder

suryansh-shedge
Suryansh Shedge
Batting Allrounder

cooper-connolly
Cooper Connolly
Batting Allrounder

azmatullah-omarzai
Azmatullah Omarzai
Bowling Allrounder

marco-jansen
Marco Jansen
Bowling Allrounder

praveen-dubey
Praveen Dubey
Bowling Allrounder

WICKET KEEPERS
prabhsimran-singh
Prabhsimran Singh
WK-Batsman

vishnu-vinod
Vishnu Vinod
WK-Batsman

BOWLERS
arshdeep-singh
Arshdeep Singh
Bowler

xavier-bartlett
Xavier Bartlett
Bowler

yuzvendra-chahal
Yuzvendra Chahal
Bowler

lockie-ferguson
Lockie Ferguson
Bowler

harpreet-brar
Harpreet Brar
Bowler

vijaykumar-vyshak
Vijaykumar Vyshak
Bowler

yash-thakur
Yash Thakur
Bowler

ben-dwarshuis
Ben Dwarshuis
Bowler

vishal-nishad
Vishal Nishad
Bowler

KKR
BATTERS
ajinkya-rahane
Ajinkya Rahane
Batsman

manish-pandey
Manish Pandey
Batsman

rovman-powell
Rovman Powell
Batsman

angkrish-raghuvanshi
Angkrish Raghuvanshi
Batsman

rinku-singh
Rinku Singh
Batsman

finn-allen
Finn Allen
Batsman

rahul-tripathi
Rahul Tripathi
Batsman

sarthak-ranjan
Sarthak Ranjan
Batsman

ALL ROUNDERS
ramandeep-singh
Ramandeep Singh
Batting Allrounder

anukul-roy
Anukul Roy
Batting Allrounder

cameron-green
Cameron Green
Batting Allrounder

rachin-ravindra
Rachin Ravindra
Batting Allrounder

sunil-narine
Sunil Narine
Bowling Allrounder

daksh-kamra
Daksh Kamra
Bowling Allrounder

WICKET KEEPERS
tim-seifert
Tim Seifert
WK-Batsman

tejasvi-dahiya
Tejasvi Dahiya
WK-Batsman

BOWLERS
vaibhav-arora
Vaibhav Arora
Bowler

umran-malik
Umran Malik
Bowler

varun-chakaravarthy
Varun Chakaravarthy
Bowler

prashant-solanki
Prashant Solanki
Bowler

kartik-tyagi
Kartik Tyagi
Bowler

matheesha-pathirana
Matheesha Pathirana
Bowler

akash-deep
Akash Deep
Bowler

blessing-muzarabani
Blessing Muzarabani
Bowler

harshit-rana
Harshit Rana
Bowler

SRH
BATTERS
travis-head
Travis Head
Batsman

smaran-ravichandran
Smaran Ravichandran
Batsman

aniket-verma
Aniket Verma
Batsman

ALL ROUNDERS
abhishek-sharma
Abhishek Sharma
Batting Allrounder

kamindu-mendis
Kamindu Mendis
Batting Allrounder

nitish-kumar-reddy
Nitish Kumar Reddy
Batting Allrounder

liam-livingstone
Liam Livingstone
Batting Allrounder

harsh-dubey
Harsh Dubey
Bowling Allrounder

shivang-kumar
Shivang Kumar
Bowling Allrounder

WICKET KEEPERS
ishan-kishan
Ishan Kishan
WK-Batsman

heinrich-klaasen
Heinrich Klaasen
WK-Batsman

salil-arora
Salil Arora
WK-Batsman

BOWLERS
brydon-carse
Brydon Carse
Bowler

pat-cummins
Pat Cummins (Captain)
Bowler

eshan-malinga
Eshan Malinga
Bowler

jaydev-unadkat
Jaydev Unadkat
Bowler

harshal-patel
Harshal Patel
Bowler

zeeshan-ansari
Zeeshan Ansari
Bowler

sakib-hussain
Sakib Hussain
Bowler

onkar-tukaram-tarmale
Onkar Tukaram Tarmale
Bowler

amit-kumar
Amit Kumar
Bowler

praful-hinge
Praful Hinge
Bowler

krains-fuletra
Krains Fuletra
Bowler

shivam-mavi
Shivam Mavi
Bowler

RR
BATTERS
shubham-dubey
Shubham Dubey
Batsman

shimron-hetmyer
Shimron Hetmyer
Batsman

yashasvi-jaiswal
Yashasvi Jaiswal
Batsman

vaibhav-sooryavanshi
Vaibhav Sooryavanshi
Batsman

aman-rao-perala
Aman Rao Perala
Batsman

ALL ROUNDERS
riyan-parag
Riyan Parag (Captain)
Batting Allrounder

ravindra-jadeja
Ravindra Jadeja
Bowling Allrounder

WICKET KEEPERS
dhruv-jurel
Dhruv Jurel
WK-Batsman

lhuan-dre-pretorius
Lhuan-dre Pretorius
WK-Batsman

donovan-ferreira
Donovan Ferreira
WK-Batsman

ravi-singh
Ravi Singh
WK-Batsman

BOWLERS
jofra-archer
Jofra Archer
Bowler

nandre-burger
Nandre Burger
Bowler

tushar-deshpande
Tushar Deshpande
Bowler

kwena-maphaka
Kwena Maphaka
Bowler

sandeep-sharma
Sandeep Sharma
Bowler

yudhvir-singh-charak
Yudhvir Singh Charak
Bowler

vignesh-puthur
Vignesh Puthur
Bowler

yash-raj-punja
Yash Raj Punja
Bowler

sushant-mishra
Sushant Mishra
Bowler

ravi-bishnoi
Ravi Bishnoi
Bowler

brijesh-sharma
Brijesh Sharma
Bowler

adam-milne
Adam Milne
Bowler

kuldeep-sen
Kuldeep Sen
Bowler

LSG
BATTERS
himmat-singh
Himmat Singh
Batsman

aiden-markram
Aiden Markram
Batsman

akshat-raghuwanshi
Akshat Raghuwanshi
Batsman

ALL ROUNDERS
abdul-samad
Abdul Samad
Batting Allrounder

ayush-badoni
Ayush Badoni
Batting Allrounder

arshin-kulkarni
Arshin Kulkarni
Batting Allrounder

mitchell-marsh
Mitchell Marsh
Batting Allrounder

shahbaz-ahmed
Shahbaz Ahmed
Bowling Allrounder

arjun-sachin-tendulkar
Arjun Sachin Tendulkar
Bowling Allrounder

wanindu-hasaranga
Wanindu Hasaranga
Bowling Allrounder

WICKET KEEPERS
rishabh-pant
Rishabh Pant
WK-Batsman

matthew-breetzke
Matthew Breetzke
WK-Batsman

nicholas-pooran
Nicholas Pooran
WK-Batsman

mukul-choudhary
Mukul Choudhary
WK-Batsman

josh-inglis
Josh Inglis
WK-Batsman

BOWLERS
akash-maharaj-singh
Akash Maharaj Singh
Bowler

avesh-khan
Avesh Khan
Bowler

mohammed-shami
Mohammed Shami
Bowler

prince-yadav
Prince Yadav
Bowler

mohsin-khan
Mohsin Khan
Bowler

digvesh-singh-rathi
Digvesh Singh Rathi
Bowler

manimaran-siddharth
Manimaran Siddharth
Bowler

mayank-prabhu-yadav
Mayank Prabhu Yadav
Bowler

anrich-nortje
Anrich Nortje
Bowler

naman-tiwari
Naman Tiwari
Bowler
`;

const lines = rawText.split('\n').map(l => l.trim()).filter(l => l);
const teamsData = {};
let currentTeam = null;

const ALL_TEAMS = ['CSK', 'DC', 'GT', 'RCB', 'PK', 'PBKS', 'KKR', 'SRH', 'RR', 'LSG', 'MI'];

for (let i = 0; i < lines.length; i++) {
   const line = lines[i];
   if (ALL_TEAMS.includes(line)) {
       currentTeam = line === 'PK' ? 'PBKS' : line;
       if (!teamsData[currentTeam]) teamsData[currentTeam] = [];
       continue;
   }

   if (['BATTERS', 'ALL ROUNDERS', 'WICKET KEEPERS', 'BOWLERS'].includes(line)) {
       continue;
   }

   // The format is 3 lines per player:
   // 1. id string (e.g. ruturaj-gaikwad)
   // 2. Name string (e.g. Ruturaj Gaikwad (Captain))
   // 3. Role string (e.g. Batsman)
   if (line.includes('-')) {
       // This is the ID line. The next line is the name.
       let name = lines[i+1];
       if (name) {
           name = name.replace(' (Captain)', '').trim();
           teamsData[currentTeam].push(name);
       }
       i += 2; // skip the next two lines we just consumed
   }
}

fs.writeFileSync('parsedTeamsData.json', JSON.stringify(teamsData, null, 2));
console.log('Successfully parsed teams. Waiting for MI...');
