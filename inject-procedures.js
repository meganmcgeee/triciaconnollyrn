const fs = require('fs');
const path = require('path');

const locationsPath = path.join(__dirname, 'locations.json');

if (!fs.existsSync(locationsPath)) {
  console.error('Error: locations.json not found!');
  process.exit(1);
}

const locations = JSON.parse(fs.readFileSync(locationsPath, 'utf8'));

// Define procedure specialties
const specialties = [
  {
    specialtyName: "Rhytidectomy & Facial Rejuvenation (Facelift, Neck Lift, Blepharoplasty)",
    clinicalCondition: "critical blood pressure control to prevent hematomas, delicate suture line care, cold-compress timing, and swelling management",
    procedureFAQQuestion: "What is your clinical protocol for post-facelift recovery at home?",
    procedureFAQAnswer: "Tricia monitors early-stage metrics closely: keeping head elevation at 30-45 degrees, managing blood pressure to protect delicate suture lines, assessing for hematoma or skin flap congestion, and implementing cooling protocols to minimize swelling and bruising."
  },
  {
    specialtyName: "High-Definition Liposuction & Body Contouring (Lipo, Abdominoplasty, Mommy Makeover)",
    clinicalCondition: "fluid balance monitoring, surgical drain output tracking, compression garment adjustments, and seroma prevention",
    procedureFAQQuestion: "How do you manage surgical drains and compression garments after liposuction?",
    procedureFAQAnswer: "Tricia records drain outputs hourly/daily, ensures sterile vacuum pressure is maintained, performs site care to prevent infection, and assists with the safe, comfortable adjustment of medical compression garments to optimize body contouring results."
  },
  {
    specialtyName: "Complex Reconstructive Surgery (Breast Reconstruction, Flap Procedures, Gender-Affirming Surgery)",
    clinicalCondition: "microvascular tissue perfusion monitoring, sterile dressing changes, graft protection, and high-acuity surgical site assessment",
    procedureFAQQuestion: "What specialized monitoring do you provide for complex reconstructive surgery?",
    procedureFAQAnswer: "Tricia performs rigorous capillary refill checks and temperature monitoring of reconstructed flaps to ensure healthy tissue perfusion. She manages sterile dressing changes, tracks drainage, and coordinates closely with reconstructive surgeons for any immediate adjustments."
  },
  {
    specialtyName: "Major Orthopedic & Spine Recovery (Joint Replacements, Laminectomy, Spinal Fusions)",
    clinicalCondition: "early mobility assistance, neurovascular checks, DVT prevention, and post-surgical pain management",
    procedureFAQQuestion: "How do you assist with mobility and pain management after orthopedic or spine surgery?",
    procedureFAQAnswer: "Tricia administers prescribed pain regimens to facilitate scheduled physical therapy, performs neurovascular checks (pulse, sensation, movement), monitors for deep vein thrombosis (DVT), and assists with safe transfer techniques in your home."
  }
];

// Map specialties to locations
locations.forEach((loc, index) => {
  const spec = specialties[index % specialties.length];
  loc.specialtyName = spec.specialtyName;
  loc.clinicalCondition = spec.clinicalCondition;
  loc.procedureFAQQuestion = spec.procedureFAQQuestion;
  loc.procedureFAQAnswer = spec.procedureFAQAnswer;
});

// Save updated locations.json
fs.writeFileSync(locationsPath, JSON.stringify(locations, null, 2), 'utf8');
console.log('Successfully injected procedure specialties into locations.json!');
