"""
Inference Engine for AarogyaGuard
Performs real-time predictions using trained models
"""

import json
import pickle
from typing import Dict, List, Any
import os


class InferenceEngine:
    """Run inference using trained ML models"""

    def __init__(self, models_directory: str = "ml-service/models"):
        self.models_directory = models_directory
        self.models = {}
        self.vectorizers = {}
        self.load_models()

        # Fallback knowledge base for when models are unavailable
        self.fallback_knowledge = self._create_fallback_knowledge()

    def load_models(self):
        """Load trained models from disk"""
        if not os.path.exists(self.models_directory):
            print(f"Warning: Models directory not found at {self.models_directory}. Using fallback logic.")
            return

        try:
            for model_file in os.listdir(self.models_directory):
                if model_file.endswith(".pkl"):
                    filepath = os.path.join(self.models_directory, model_file)
                    with open(filepath, "rb") as f:
                        if "vectorizer" in model_file:
                            self.vectorizers[model_file.replace("vectorizer_", "").replace(".pkl", "")] = (
                                pickle.load(f)
                            )
                        else:
                            self.models[model_file.replace(".pkl", "")] = pickle.load(f)
                    print(f"Loaded: {filepath}")
        except Exception as e:
            print(f"Error loading models: {e}. Using fallback logic.")

    def _create_fallback_knowledge(self) -> Dict[str, Any]:
        """Create rule-based fallback knowledge base"""
        return {
            "symptom_conditions": {
                "fever,cough,body_ache": ["Influenza", "COVID-19"],
                "runny_nose,sneezing,sore_throat": ["Common Cold"],
                "persistent_cough,chest_discomfort": ["Bronchitis"],
                "fever,cough,chest_pain": ["Pneumonia"],
                "nausea,vomiting,diarrhea": ["Gastroenteritis"],
                "headache,nausea": ["Migraine"],
                "chest_pain,shortness_of_breath": ["Heart Disease", "Asthma"],
                "shortness_of_breath,wheezing": ["Asthma"],
            },
            "risk_mappings": {
                "high": ["chest_pain", "shortness_of_breath", "loss_of_consciousness"],
                "medium": ["fever", "persistent_cough", "severe_headache"],
                "low": ["runny_nose", "mild_headache", "sneezing"],
            },
            "medicine_recommendations": {
                "Influenza": ["paracetamol", "ibuprofen"],
                "Common Cold": ["cetirizine", "paracetamol"],
                "Bronchitis": ["azithromycin", "salbutamol"],
                "Pneumonia": ["amoxicillin", "azithromycin"],
                "Gastroenteritis": ["ondansetron", "loperamide"],
                "Migraine": ["ibuprofen", "paracetamol"],
                "Asthma": ["salbutamol"],
                "Heart Disease": ["aspirin", "lisinopril"],
                "Hypertension": ["lisinopril", "metoprolol"],
                "Diabetes": ["metformin", "insulin"],
            },
            "ddi_warnings": {
                ("aspirin", "ibuprofen"): ("high", "Increased bleeding risk"),
                ("warfarin", "aspirin"): ("high", "Severe bleeding risk"),
                ("metformin", "contrast_dye"): ("high", "Kidney damage risk"),
                ("lisinopril", "potassium"): ("high", "Hyperkalemia risk"),
            },
        }

    def predict_conditions(self, symptoms_text: str) -> Tuple[List[Dict[str, Any]], str]:
        """Predict probable conditions from symptom text"""
        try:
            if "symptom_text" in self.vectorizers and "symptom_disease" in self.models:
                X = self.vectorizers["symptom_text"].transform([symptoms_text])
                clf = self.models["symptom_disease"]
                probabilities = clf.predict_proba(X)[0]
                classes = clf.classes_
                top_indices = probabilities.argsort()[-3:][::-1]

                predictions = [
                    {"condition": classes[i], "confidence": float(probabilities[i])} for i in top_indices
                ]
                return predictions, "ML Model"
            else:
                return self._fallback_predict_conditions(symptoms_text), "Fallback Rule-Based"
        except Exception as e:
            print(f"Condition prediction error: {e}")
            return self._fallback_predict_conditions(symptoms_text), "Fallback Rule-Based"

    def _fallback_predict_conditions(self, symptoms_text: str) -> List[Dict[str, Any]]:
        """Fallback rule-based condition prediction"""
        symptom_keywords = symptoms_text.lower().split()
        matched_conditions = []

        for symptom_pattern, conditions in self.fallback_knowledge["symptom_conditions"].items():
            if any(keyword in symptom_keywords for keyword in symptom_pattern.split(",")):
                for cond in conditions:
                    matched_conditions.append({"condition": cond, "confidence": 0.75})

        if not matched_conditions:
            matched_conditions = [
                {"condition": "Viral Infection", "confidence": 0.6},
                {"condition": "Common Cold", "confidence": 0.5},
            ]

        return matched_conditions[:3]

    def predict_risk_level(self, symptoms: List[str], age: int) -> Tuple[str, str]:
        """Predict risk level"""
        try:
            if "red_flag_detector" in self.models:
                high_risk_symptoms = ["chest_pain", "shortness_of_breath", "loss_of_consciousness"]
                feature_value = sum(1 for s in symptoms if s in high_risk_symptoms)
                risk_pred = self.models["red_flag_detector"].predict([[feature_value]])[0]
                risk_level = "high" if risk_pred else "low"
                return risk_level, "ML Model"
            else:
                return self._fallback_predict_risk(symptoms, age), "Fallback Rule-Based"
        except Exception as e:
            print(f"Risk prediction error: {e}")
            return self._fallback_predict_risk(symptoms, age), "Fallback Rule-Based"

    def _fallback_predict_risk(self, symptoms: List[str], age: int) -> str:
        """Fallback rule-based risk prediction"""
        high_risk_symptoms = self.fallback_knowledge["risk_mappings"]["high"]
        if any(s in high_risk_symptoms for s in symptoms):
            return "high"
        elif age > 65 or any(s in self.fallback_knowledge["risk_mappings"]["medium"] for s in symptoms):
            return "medium"
        return "low"

    def detect_red_flags(self, symptoms: List[str]) -> Tuple[bool, List[str]]:
        """Detect emergency red flags"""
        red_flag_symptoms = [
            "chest_pain",
            "shortness_of_breath",
            "loss_of_consciousness",
            "uncontrolled_bleeding",
            "severe_allergic_reaction",
        ]
        detected_flags = [s for s in symptoms if s in red_flag_symptoms]
        return len(detected_flags) > 0, detected_flags

    def recommend_medicines(self, conditions: List[str]) -> List[Dict[str, Any]]:
        """Recommend medicines for conditions"""
        medicines = []
        medicine_db = {
            "paracetamol": {"class": "Analgesic", "dose": "500mg", "frequency": "Twice daily"},
            "ibuprofen": {"class": "NSAID", "dose": "400mg", "frequency": "Twice daily"},
            "azithromycin": {"class": "Antibiotic", "dose": "500mg", "frequency": "Once daily"},
            "cetirizine": {"class": "Antihistamine", "dose": "10mg", "frequency": "Once daily"},
            "salbutamol": {"class": "Bronchodilator", "dose": "100mcg", "frequency": "As needed"},
            "lisinopril": {"class": "ACE Inhibitor", "dose": "10mg", "frequency": "Once daily"},
            "metformin": {"class": "Antidiabetic", "dose": "500mg", "frequency": "Twice daily"},
        }

        for condition in conditions:
            if condition in self.fallback_knowledge["medicine_recommendations"]:
                med_ids = self.fallback_knowledge["medicine_recommendations"][condition]
                for med_id in med_ids[:2]:
                    if med_id in medicine_db:
                        medicines.append(
                            {
                                "id": med_id,
                                "name": med_id.title(),
                                "class": medicine_db[med_id]["class"],
                                "dose": medicine_db[med_id]["dose"],
                                "frequency": medicine_db[med_id]["frequency"],
                                "description": f"Recommended for {condition} treatment",
                            }
                        )

        return medicines

    def check_ddi(self, medicines: List[str], current_medications: List[str]) -> List[Dict[str, Any]]:
        """Check for drug-drug interactions"""
        interactions = []

        for med1 in current_medications:
            for med2 in medicines:
                ddi_key = tuple(sorted([med1, med2]))
                if ddi_key in self.fallback_knowledge["ddi_warnings"]:
                    severity, reason = self.fallback_knowledge["ddi_warnings"][ddi_key]
                    interactions.append(
                        {"drug1": med1, "drug2": med2, "severity": severity, "description": reason}
                    )

        return interactions

    def generate_consultation_summary(
        self, symptoms: List[str], conditions: List[Dict[str, Any]], risk_level: str, medicines: List[Dict[str, Any]]
    ) -> str:
        """Generate patient-friendly consultation summary"""
        summary = f"Consultation Summary\n"
        summary += f"===================\n\n"
        summary += f"Reported Symptoms: {', '.join(symptoms)}\n"
        summary += f"Probable Conditions: {', '.join([c['condition'] for c in conditions])}\n"
        summary += f"Risk Level: {risk_level.upper()}\n"
        summary += f"Recommended Medicines: {', '.join([m['name'] for m in medicines])}\n\n"
        summary += f"⚠️ DISCLAIMER: This is an educational assistant only. "
        summary += f"Always consult a licensed physician for medical diagnosis and treatment.\n"

        return summary


# Type hints
from typing import Tuple

if __name__ == "__main__":
    engine = InferenceEngine()
    print("Inference engine initialized successfully")
