"""
Synthetic Medical Consultation Dataset Generator
Generates 10,000+ realistic medical consultation records for model training
"""

import json
import random
from datetime import datetime, timedelta
from typing import List, Dict, Any


class SyntheticDatasetGenerator:
    """Generates synthetic medical consultation data for training"""

    def __init__(self, seed: int = 42):
        random.seed(seed)
        self.seed = seed

        # Medical knowledge base
        self.symptoms_db = {
            "fever": {"severity_range": (37.5, 40.5), "duration_range": (1, 14)},
            "cough": {"severity_range": (1, 10), "duration_range": (3, 21)},
            "headache": {"severity_range": (1, 10), "duration_range": (2, 7)},
            "sore_throat": {"severity_range": (1, 10), "duration_range": (2, 7)},
            "body_ache": {"severity_range": (1, 10), "duration_range": (1, 7)},
            "fatigue": {"severity_range": (1, 10), "duration_range": (1, 14)},
            "shortness_of_breath": {"severity_range": (1, 10), "duration_range": (1, 7)},
            "chest_pain": {"severity_range": (1, 10), "duration_range": (1, 3)},
            "nausea": {"severity_range": (1, 10), "duration_range": (1, 7)},
            "vomiting": {"severity_range": (1, 10), "duration_range": (1, 3)},
            "diarrhea": {"severity_range": (1, 10), "duration_range": (1, 7)},
            "abdominal_pain": {"severity_range": (1, 10), "duration_range": (1, 7)},
            "dizziness": {"severity_range": (1, 10), "duration_range": (1, 7)},
            "runny_nose": {"severity_range": (1, 10), "duration_range": (3, 14)},
            "sneezing": {"severity_range": (1, 10), "duration_range": (1, 14)},
            "rash": {"severity_range": (1, 10), "duration_range": (2, 14)},
            "itching": {"severity_range": (1, 10), "duration_range": (1, 21)},
            "swollen_joints": {"severity_range": (1, 10), "duration_range": (3, 14)},
            "muscle_pain": {"severity_range": (1, 10), "duration_range": (1, 14)},
            "back_pain": {"severity_range": (1, 10), "duration_range": (1, 30)},
        }

        # Condition to symptoms mapping
        self.condition_symptom_map = {
            "Common Cold": {
                "symptoms": ["runny_nose", "sneezing", "sore_throat", "mild cough"],
                "risk_level": "low",
                "duration_days": (3, 10),
            },
            "Influenza": {
                "symptoms": ["fever", "cough", "body_ache", "fatigue", "headache"],
                "risk_level": "medium",
                "duration_days": (7, 14),
            },
            "COVID-19": {
                "symptoms": ["fever", "cough", "fatigue", "loss of taste or smell"],
                "risk_level": "medium",
                "duration_days": (7, 14),
            },
            "Bronchitis": {
                "symptoms": ["persistent_cough", "chest_discomfort", "fatigue", "shortness_of_breath"],
                "risk_level": "medium",
                "duration_days": (10, 21),
            },
            "Pneumonia": {
                "symptoms": ["fever", "cough", "chest_pain", "shortness_of_breath"],
                "risk_level": "high",
                "duration_days": (14, 28),
                "red_flags": True,
            },
            "Gastroenteritis": {
                "symptoms": ["nausea", "vomiting", "diarrhea", "abdominal_pain"],
                "risk_level": "medium",
                "duration_days": (1, 7),
            },
            "Food Poisoning": {
                "symptoms": ["nausea", "vomiting", "diarrhea", "abdominal_pain", "fever"],
                "risk_level": "medium",
                "duration_days": (1, 3),
            },
            "Migraine": {
                "symptoms": ["severe_headache", "nausea", "sensitivity_to_light"],
                "risk_level": "low",
                "duration_days": (4, 72),
            },
            "Tension Headache": {
                "symptoms": ["mild_to_moderate_headache", "neck_stiffness"],
                "risk_level": "low",
                "duration_days": (30, 365),
            },
            "Allergic Rhinitis": {
                "symptoms": ["runny_nose", "sneezing", "itching", "watery_eyes"],
                "risk_level": "low",
                "duration_days": (365, 365),
            },
            "Asthma": {
                "symptoms": ["shortness_of_breath", "wheezing", "cough", "chest_tightness"],
                "risk_level": "medium",
                "duration_days": (365, 365),
            },
            "Urinary Tract Infection": {
                "symptoms": ["dysuria", "frequent_urination", "lower_abdominal_pain"],
                "risk_level": "low",
                "duration_days": (1, 7),
            },
            "Hypertension": {
                "symptoms": ["headache", "dizziness", "chest_pain"],
                "risk_level": "high",
                "duration_days": (365, 365),
                "red_flags": True,
            },
            "Type 2 Diabetes": {
                "symptoms": ["increased_thirst", "frequent_urination", "fatigue"],
                "risk_level": "high",
                "duration_days": (365, 365),
            },
            "Heart Disease": {
                "symptoms": ["chest_pain", "shortness_of_breath", "fatigue"],
                "risk_level": "high",
                "duration_days": (365, 365),
                "red_flags": True,
            },
        }

        # Medicines database
        self.medicines_db = {
            "paracetamol": {"class": "analgesic", "conditions": ["fever", "headache", "body_ache"]},
            "ibuprofen": {"class": "NSAID", "conditions": ["fever", "headache", "body_ache", "inflammation"]},
            "amoxicillin": {"class": "antibiotic", "conditions": ["bacterial_infection", "throat_infection"]},
            "ciprofloxacin": {"class": "antibiotic", "conditions": ["uti", "respiratory_infection"]},
            "azithromycin": {"class": "antibiotic", "conditions": ["respiratory_infection", "bacterial_infection"]},
            "loratadine": {"class": "antihistamine", "conditions": ["allergy", "rhinitis"]},
            "cetirizine": {"class": "antihistamine", "conditions": ["allergy", "rhinitis"]},
            "omeprazole": {"class": "proton_pump_inhibitor", "conditions": ["acid_reflux", "gerd"]},
            "metformin": {"class": "antidiabetic", "conditions": ["diabetes"]},
            "lisinopril": {"class": "ace_inhibitor", "conditions": ["hypertension", "heart_disease"]},
            "salbutamol": {"class": "bronchodilator", "conditions": ["asthma", "wheezing"]},
            "fluconazole": {"class": "antifungal", "conditions": ["fungal_infection"]},
            "acyclovir": {"class": "antiviral", "conditions": ["viral_infection", "herpes"]},
            "loperamide": {"class": "antidiarrheal", "conditions": ["diarrhea"]},
            "ondansetron": {"class": "antiemetic", "conditions": ["nausea", "vomiting"]},
            "prednisone": {"class": "corticosteroid", "conditions": ["inflammation", "allergy"]},
            "aspirin": {"class": "analgesic", "conditions": ["heart_disease", "stroke_prevention"]},
            "metoprolol": {"class": "beta_blocker", "conditions": ["hypertension", "heart_disease"]},
            "atorvastatin": {"class": "statin", "conditions": ["high_cholesterol", "heart_disease"]},
            "insulin": {"class": "antidiabetic", "conditions": ["diabetes"]},
        }

        # DDI database (drug-drug interactions)
        self.ddi_database = {
            ("aspirin", "ibuprofen"): {"severity": "high", "reason": "Increased bleeding risk"},
            ("metformin", "contrast_dye"): {"severity": "high", "reason": "Risk of kidney damage"},
            ("warfarin", "aspirin"): {"severity": "high", "reason": "Severe bleeding risk"},
            ("lisinopril", "potassium_supplements"): {"severity": "high", "reason": "Hyperkalemia risk"},
            ("methotrexate", "nsaids"): {"severity": "moderate", "reason": "Reduced methotrexate clearance"},
            ("simvastatin", "clarithromycin"): {"severity": "high", "reason": "Increased statin toxicity"},
            ("ssri", "tramadol"): {"severity": "moderate", "reason": "Serotonin syndrome risk"},
            ("fluoxetine", "maois"): {"severity": "high", "reason": "Serotonin syndrome"},
            ("metformin", "alcohol"): {"severity": "moderate", "reason": "Lactic acidosis risk"},
            ("warfarin", "cranberry"): {"severity": "moderate", "reason": "Increased anticoagulation"},
        }

        self.existing_conditions = ["hypertension", "diabetes", "asthma", "none"]
        self.existing_medications = ["lisinopril", "metformin", "salbutamol", "none"]

    def generate_consultation(self, patient_id: str) -> Dict[str, Any]:
        """Generate a single synthetic consultation record"""

        # Select a random condition
        condition = random.choice(list(self.condition_symptom_map.keys()))
        condition_info = self.condition_symptom_map[condition]

        # Generate symptoms
        base_symptoms = condition_info["symptoms"][:3]
        additional_symptoms = random.sample(
            [s for s in list(self.symptoms_db.keys()) if s not in base_symptoms],
            k=random.randint(1, 2),
        )
        symptoms = base_symptoms + additional_symptoms

        # Create symptom text
        symptoms_text = f"Patient reports {', '.join(symptoms)}. Symptoms started {random.randint(1, 7)} days ago."

        # Generate risk level
        risk_level = condition_info.get("risk_level", "low")
        if condition_info.get("red_flags"):
            risk_level = "high" if risk_level != "critical" else "critical"

        # Generate medicines
        suggested_medicines = []
        for medicine_id, med_info in list(self.medicines_db.items())[: random.randint(2, 4)]:
            if any(cond in " ".join(symptoms).lower() for cond in med_info["conditions"]):
                suggested_medicines.append(
                    {
                        "id": medicine_id,
                        "name": medicine_id.title(),
                        "class": med_info["class"],
                        "dose": f"{random.choice([250, 500, 1000])}mg",
                        "frequency": random.choice(["Once daily", "Twice daily", "Three times daily"]),
                        "description": f"Recommended for treating {med_info['class']} related symptoms",
                    }
                )

        # Check for DDI
        ddi_alerts = []
        current_meds = [random.choice(self.existing_medications) for _ in range(random.randint(0, 2))]
        for med1 in current_meds:
            for med2 in suggested_medicines:
                ddi_key = tuple(sorted([med1, med2["id"]]))
                if ddi_key in self.ddi_database:
                    ddi_alerts.append(
                        {
                            "drug1": med1,
                            "drug2": med2["id"],
                            "severity": self.ddi_database[ddi_key]["severity"],
                            "description": self.ddi_database[ddi_key]["reason"],
                        }
                    )

        # Generate patient summary
        patient_summary = f"Patient with {condition}. Primary symptoms: {', '.join(base_symptoms)}. "
        patient_summary += f"Risk level: {risk_level}. "
        if ddi_alerts:
            patient_summary += f"Warning: {len(ddi_alerts)} potential drug interactions detected. "
        patient_summary += "Consultation for educational purposes only. Please consult a licensed physician."

        return {
            "patient_id": patient_id,
            "symptoms_text": symptoms_text,
            "extracted_symptoms": symptoms,
            "age": random.randint(18, 80),
            "gender": random.choice(["male", "female"]),
            "predicted_conditions": [condition],
            "risk_level": risk_level,
            "red_flags": condition_info.get("red_flags", False),
            "medicines_recommended": suggested_medicines,
            "drug_interactions": ddi_alerts,
            "timestamp": (datetime.now() - timedelta(days=random.randint(0, 365))).isoformat(),
            "current_medications": current_meds,
        }

    def generate_dataset(self, num_records: int = 10000) -> List[Dict[str, Any]]:
        """Generate a complete synthetic dataset"""
        print(f"Generating {num_records} synthetic medical consultation records...")
        dataset = []
        for i in range(num_records):
            consultation = self.generate_consultation(f"patient_{i}")
            dataset.append(consultation)
            if (i + 1) % 1000 == 0:
                print(f"Generated {i + 1}/{num_records} records")
        return dataset

    def save_dataset(self, dataset: List[Dict[str, Any]], filepath: str):
        """Save dataset to JSON file"""
        with open(filepath, "w") as f:
            json.dump(dataset, f, indent=2)
        print(f"Dataset saved to {filepath}")


if __name__ == "__main__":
    generator = SyntheticDatasetGenerator()
    dataset = generator.generate_dataset(10000)
    generator.save_dataset(dataset, "ml-service/synthetic_data.json")
