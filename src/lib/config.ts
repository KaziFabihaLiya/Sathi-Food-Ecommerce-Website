export const SITE = {
  name: "Shathi Foods",
  tagline: "Pure taste. Honest roots.",
  whatsappNumber: process.env.NEXT_PUBLIC_WHATSAPP ?? "8801805080012",
  whatsappDisplay: "+880 1805-080012",
  email: process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "shathifoodsbd@gmail.com",
  facebook: process.env.NEXT_PUBLIC_FACEBOOK_URL ?? "https://facebook.com/",
  instagram: process.env.NEXT_PUBLIC_INSTAGRAM_URL ?? "https://instagram.com/",
};

export const bdt = (n: number) => `৳${n.toLocaleString("en-US")}`;
export const bdtText = (n: number) => `BDT ${n.toLocaleString("en-US")}`;
export const fmtDateTime = (d: string) => new Date(d).toLocaleString("en-US", { timeZone: "Asia/Dhaka" });
export const fmtDate = (d: string) => new Date(d).toLocaleDateString("en-US", { timeZone: "Asia/Dhaka" });

export const DISTRICTS = [
  "Bagerhat","Bandarban","Barguna","Barishal","Bhola","Bogura","Brahmanbaria","Chandpur","Chattogram","Chuadanga",
  "Cumilla","Cox's Bazar","Dhaka","Dinajpur","Faridpur","Feni","Gaibandha","Gazipur","Gopalganj","Habiganj",
  "Jamalpur","Jashore","Jhalokathi","Jhenaidah","Joypurhat","Khagrachhari","Khulna","Kishoreganj","Kurigram","Kushtia",
  "Lakshmipur","Lalmonirhat","Madaripur","Magura","Manikganj","Meherpur","Moulvibazar","Munshiganj","Mymensingh","Naogaon",
  "Narail","Narayanganj","Narsingdi","Natore","Netrokona","Nilphamari","Noakhali","Pabna","Panchagarh","Patuakhali",
  "Pirojpur","Rajbari","Rajshahi","Rangamati","Rangpur","Satkhira","Shariatpur","Sherpur","Sirajganj","Sunamganj",
  "Sylhet","Tangail","Thakurgaon",
];
