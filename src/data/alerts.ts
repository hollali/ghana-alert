import type { Alert } from '@/src/types';

const HOUR = 3600_000;
const now = Date.now();
const ago = (hours: number) => new Date(now - hours * HOUR).toISOString();

export const alerts: Alert[] = [
  {
    id: '1',
    title: 'Contaminated Cereals (Imported Brand)',
    summary:
      'The FDA has warned consumers against consuming certain batches of imported cereals due to possible contamination.',
    body: 'The Food and Drugs Authority (FDA) has warned consumers in Ghana against consuming certain batches of imported cereals due to possible contamination with harmful bacteria. The affected batches were distributed to supermarkets and open markets across Greater Accra, Ashanti and Western regions. Anyone who has purchased the product should check the batch number printed on the side of the pack and stop using it immediately.',
    category: 'food-health',
    priority: 'high',
    source: 'FDA Ghana',
    publishedAt: ago(2),
    affectedProducts: {
      brand: 'Sunrise Corn Flakes',
      batchNumbers: ['23045A', '23045B'],
      bestBefore: 'Dec 2026',
    },
    recommendedActions: [
      'Do not consume the affected products.',
      'Check the batch number on your package.',
      'Return to the point of purchase for a refund.',
    ],
    viewCount: 1842,
  },
  {
    id: '2',
    title: 'Fake MTN Data Bundles',
    summary:
      'Beware of fraudulent messages offering unusually cheap data bundles and asking you to dial a short code.',
    body: 'A wave of fraudulent messages is circulating on WhatsApp and SMS claiming to offer heavily discounted MTN data bundles. The messages ask recipients to dial a short code or send mobile money to a personal number. MTN Ghana has confirmed that these offers are not authorised. Do not share your PIN, OTP or mobile money details with anyone.',
    category: 'scams-fraud',
    priority: 'high',
    source: 'Cyber Security Authority',
    publishedAt: ago(4),
    recommendedActions: [
      'Ignore messages offering data bundles far below market price.',
      'Never share your mobile money PIN or OTP.',
      'Report suspicious numbers to 191 or the Cyber Security Authority.',
    ],
    viewCount: 2410,
  },
  {
    id: '3',
    title: 'Recalled Toy – Choking Hazard',
    summary:
      'A popular children’s toy has been recalled because small parts can detach and pose a choking risk.',
    body: 'The Ghana Standards Authority has issued a recall for a popular plastic building-block toy sold in several markets. Testing found that small parts can detach under normal use, creating a serious choking hazard for children under three. Parents and caregivers should take the toy away from children and return it to the retailer for a full refund.',
    category: 'product-safety',
    priority: 'high',
    source: 'Ghana Standards Authority',
    publishedAt: ago(6),
    affectedProducts: {
      brand: 'BrightBlocks Junior',
      batchNumbers: ['BB-118', 'BB-119', 'BB-124'],
      bestBefore: 'Not applicable',
    },
    recommendedActions: [
      'Take the toy away from children immediately.',
      'Check the model number on the packaging.',
      'Return it to the retailer for a refund.',
    ],
    viewCount: 1280,
  },
  {
    id: '4',
    title: 'Flight Schedule Changes',
    summary:
      'Several domestic flights have been rescheduled due to runway maintenance at Kotoka International Airport.',
    body: 'Airlines operating domestic routes have announced schedule changes while runway maintenance takes place at Kotoka International Airport. Passengers travelling to Kumasi, Tamale and Takoradi should confirm their departure times with their airline before travelling to the airport. Delays of up to 90 minutes are expected during the maintenance window.',
    category: 'travel-transport',
    priority: 'medium',
    source: 'Ghana Airports Company',
    publishedAt: ago(8),
    recommendedActions: [
      'Check your flight status before leaving home.',
      'Arrive at the airport at least two hours early.',
      'Contact your airline for rebooking options.',
    ],
    viewCount: 730,
  },
  {
    id: '5',
    title: 'Unregistered Herbal Medicine',
    summary:
      'A herbal product marketed for blood pressure is being sold without FDA registration.',
    body: 'The Food and Drugs Authority has alerted the public to an unregistered herbal product being promoted on social media as a treatment for high blood pressure. The product has not been evaluated for safety or efficacy and its labels make unproven medical claims. Consumers are advised to consult a qualified health professional and to buy medicines only from licensed pharmacies.',
    category: 'food-health',
    priority: 'medium',
    source: 'FDA Ghana',
    publishedAt: ago(10),
    viewCount: 540,
  },
  {
    id: '6',
    title: 'Energy Meter Maintenance',
    summary:
      'Planned maintenance will interrupt power supply in parts of Tema for four hours on Saturday.',
    body: 'The Electricity Company of Ghana has announced planned maintenance on its distribution network in parts of Tema. The interruption will affect Communities 1 to 9 and the Tema Industrial Area between 8:00am and 12:00pm on Saturday. Customers are advised to treat all lines as live during the outage.',
    category: 'services',
    priority: 'low',
    source: 'Electricity Company of Ghana',
    publishedAt: ago(12),
    viewCount: 340,
  },
  {
    id: '7',
    title: 'Fake Online Loan Apps',
    summary:
      'Unauthorised loan apps are harvesting contact lists and demanding repayment from people who never borrowed.',
    body: 'The Bank of Ghana has warned about unauthorised mobile lending apps that collect excessive personal data, including contact lists and photos, and use them to harass borrowers and their families. Some apps also demand repayment from people who never took a loan. Only use lenders licensed by the Bank of Ghana and check permissions before installing any app.',
    category: 'scams-fraud',
    priority: 'high',
    source: 'Bank of Ghana',
    publishedAt: ago(24),
    recommendedActions: [
      'Check that a lender is licensed by the Bank of Ghana.',
      'Review app permissions before installing.',
      'Report harassment to the Bank of Ghana or the Police.',
    ],
    viewCount: 3120,
  },
  {
    id: '8',
    title: 'Faulty Phone Chargers',
    summary:
      'Counterfeit chargers sold at some markets can overheat and cause electric shock or fire.',
    body: 'Safety inspectors have found counterfeit phone chargers in circulation that do not meet national electrical safety standards. The chargers can overheat, damage devices and, in some cases, cause electric shock or fire. Consumers should buy chargers from authorised retailers and stop using any charger that becomes unusually hot.',
    category: 'product-safety',
    priority: 'medium',
    source: 'Ghana Standards Authority',
    publishedAt: ago(27),
    viewCount: 860,
  },
  {
    id: '9',
    title: 'New Refund Rules for Retailers',
    summary:
      'Retailers must now offer a refund or replacement for faulty goods reported within 30 days.',
    body: 'The Consumer Protection Agency has reminded retailers of updated rules requiring a refund or replacement for faulty goods reported within 30 days of purchase. Receipts should be issued for every sale, and retailers cannot refuse a valid claim because packaging has been opened. Consumers who need help can contact the Agency with their receipt and details of the fault.',
    category: 'consumer-rights',
    priority: 'low',
    source: 'Consumer Protection Agency',
    publishedAt: ago(30),
    viewCount: 420,
  },
  {
    id: '10',
    title: 'Fuel Price Adjustment Notice',
    summary:
      'Petrol and diesel prices will change at the pumps from the first of next month.',
    body: 'The National Petroleum Authority has published a minor adjustment to fuel prices effective from the first of next month. Retailers are required to display the new prices clearly at every station. Motorists are encouraged to compare prices and to report stations that charge above the published rate.',
    category: 'services',
    priority: 'low',
    source: 'National Petroleum Authority',
    publishedAt: ago(48),
    viewCount: 260,
  },
  {
    id: '11',
    title: 'Highway Flooding Advisory',
    summary:
      'Heavy rain has flooded sections of the Accra–Kumasi highway. Avoid non-essential travel on the route.',
    body: 'The Ghana Highway Authority has advised motorists to avoid non-essential travel on parts of the Accra–Kumasi highway after heavy rain caused flooding near Nsawam. A section of the road is currently impassable to small vehicles. Emergency teams are on site. Drivers should use alternative routes and never attempt to cross moving floodwater.',
    category: 'travel-transport',
    priority: 'high',
    source: 'Ghana Highway Authority',
    publishedAt: ago(52),
    recommendedActions: [
      'Avoid non-essential travel on the affected stretch.',
      'Use the recommended alternative route.',
      'Never drive through moving floodwater.',
    ],
    viewCount: 1500,
  },
  {
    id: '12',
    title: 'Counterfeit Cooking Oil',
    summary:
      'Several brands of cooking oil on the market have been found to be counterfeit and unfit for use.',
    body: 'An inspection by the Food and Drugs Authority has uncovered counterfeit cooking oil being repackaged and sold under well-known brand names in parts of Accra and Kumasi. The products have inaccurate labels and do not meet food safety standards. Consumers should buy from trusted retailers and check seals and batch codes before use.',
    category: 'food-health',
    priority: 'high',
    source: 'FDA Ghana',
    publishedAt: ago(72),
    affectedProducts: {
      brand: 'Golden Fry and Fresh Cook',
      batchNumbers: ['GF-2201', 'FC-1107'],
      bestBefore: 'Sep 2026',
    },
    recommendedActions: [
      'Do not use oil with broken or missing seals.',
      'Check the batch code against the FDA notice.',
      'Report suspicious sellers to the FDA.',
    ],
    viewCount: 2110,
  },
  {
    id: '13',
    title: 'Warranty Rights Reminder',
    summary:
      'Electronic goods sold in Ghana must carry a written warranty. Know what yours covers.',
    body: 'The Consumer Protection Agency is reminding shoppers that electronic goods sold in Ghana must come with a written warranty. The warranty should state what is covered, how long it lasts and how to make a claim. Keep your receipt and warranty card, and ask the seller to explain any exclusions before you buy.',
    category: 'consumer-rights',
    priority: 'medium',
    source: 'Consumer Protection Agency',
    publishedAt: ago(96),
    viewCount: 390,
  },
  {
    id: '14',
    title: 'Public Notice: Water Rationing',
    summary:
      'Scheduled water rationing will affect parts of the Greater Accra Region until further notice.',
    body: 'Ghana Water Company Limited has announced rationing in parts of the Greater Accra Region while repairs are carried out on a major transmission line. Residents are advised to store water safely and to report leaks. A revised supply schedule will be published on the company’s website and social media pages.',
    category: 'other',
    priority: 'medium',
    source: 'Ghana Water Company Limited',
    publishedAt: ago(120),
    viewCount: 610,
  },
  {
    id: '15',
    title: 'Fake Job Recruitment Scam',
    summary:
      'Scammers are posing as recruiters and asking applicants to pay a registration fee.',
    body: 'Job seekers are being targeted by scammers who advertise non-existent vacancies and ask applicants to pay a registration or training fee. Legitimate employers do not ask for payment during recruitment. Verify every vacancy directly with the company and never send money to secure an interview.',
    category: 'scams-fraud',
    priority: 'medium',
    source: 'Cyber Security Authority',
    publishedAt: ago(144),
    recommendedActions: [
      'Never pay a fee to apply for a job.',
      'Verify vacancies on the company’s official website.',
      'Report the advert to the Cyber Security Authority.',
    ],
    viewCount: 980,
  },
];

export const featuredAlert =
  alerts.find((alert) => alert.priority === 'high') ?? alerts[0];
