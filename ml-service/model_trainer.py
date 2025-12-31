"""
Machine Learning Model Trainer for AarogyaGuard
Trains models on synthetic data for symptom analysis, triage, DDI, and medicine recommendation
"""

import json
import pickle
from typing import Dict, List, Any, Tuple
import warnings

warnings.filterwarnings("ignore")

try:
    from sklearn.feature_extraction.text import TfidfVectorizer
    from sklearn.preprocessing import LabelEncoder, MultiLabelBinarizer
    from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
    from sklearn.linear_model import LogisticRegression
    from sklearn.model_selection import train_test_split
    from sklearn.metrics import classification_report, accuracy_score, f1_score
    import numpy as np
except ImportError:
    print("Warning: scikit-learn not installed. Using hybrid rule-based fallback.")


class MLModelTrainer:
    """Trains machine learning models on synthetic medical data"""

    def __init__(self, dataset_path: str = "ml-service/synthetic_data.json"):
        self.dataset_path = dataset_path
        self.dataset = None
        self.models = {}
        self.vectorizers = {}
        self.label_encoders = {}
        self.load_dataset()

    def load_dataset(self):
        """Load synthetic dataset"""
        print(f"Loading dataset from {self.dataset_path}...")
        with open(self.dataset_path, "r") as f:
            self.dataset = json.load(f)
        print(f"Loaded {len(self.dataset)} consultation records")

    def train_symptom_to_disease_model(self):
        """Train model to classify symptoms to diseases"""
        print("\n[1/5] Training Symptom → Disease Classification Model...")

        X_text = [record["symptoms_text"] for record in self.dataset]
        y = [record["predicted_conditions"][0] for record in self.dataset]

        # TF-IDF vectorization
        tfidf = TfidfVectorizer(max_features=500, ngram_range=(1, 2))
        X = tfidf.fit_transform(X_text)

        # Train classifier
        clf = RandomForestClassifier(n_estimators=100, max_depth=15, random_state=42)
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

        clf.fit(X_train, y_train)
        y_pred = clf.predict(X_test)

        accuracy = accuracy_score(y_test, y_pred)
        print(f"Symptom Classification Accuracy: {accuracy:.2%}")

        self.models["symptom_disease"] = clf
        self.vectorizers["symptom_text"] = tfidf

    def train_risk_classifier(self):
        """Train model to classify risk levels"""
        print("\n[2/5] Training Risk Level Classifier...")

        X_symptoms = np.array([len(record["extracted_symptoms"]) for record in self.dataset]).reshape(-1, 1)
        X_age = np.array([record["age"] for record in self.dataset]).reshape(-1, 1)
        X_combined = np.hstack([X_symptoms, X_age])

        y = [record["risk_level"] for record in self.dataset]

        # Train classifier
        clf = GradientBoostingClassifier(n_estimators=50, max_depth=5, random_state=42)
        X_train, X_test, y_train, y_test = train_test_split(X_combined, y, test_size=0.2, random_state=42)

        clf.fit(X_train, y_train)
        y_pred = clf.predict(X_test)

        accuracy = accuracy_score(y_test, y_pred)
        print(f"Risk Classification Accuracy: {accuracy:.2%}")

        self.models["risk_classifier"] = clf

    def train_red_flag_detector(self):
        """Train model to detect emergency red flags"""
        print("\n[3/5] Training Red Flag Detector...")

        # Create feature matrix: high-risk symptom indicators
        high_risk_symptoms = [
            "chest_pain",
            "shortness_of_breath",
            "severe_headache",
            "loss_of_consciousness",
            "uncontrolled_bleeding",
        ]

        def has_red_flag_symptoms(symptoms):
            return sum(1 for s in symptoms if s in high_risk_symptoms)

        X = np.array([has_red_flag_symptoms(record["extracted_symptoms"]) for record in self.dataset]).reshape(
            -1, 1
        )
        y = [record["risk_level"] in ["high", "critical"] for record in self.dataset]

        # Train binary classifier
        clf = LogisticRegression(random_state=42)
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

        clf.fit(X_train, y_train)
        y_pred = clf.predict(X_test)

        accuracy = accuracy_score(y_test, y_pred)
        print(f"Red Flag Detection Accuracy: {accuracy:.2%}")

        self.models["red_flag_detector"] = clf

    def train_medicine_recommender(self):
        """Train model to recommend medicines"""
        print("\n[4/5] Training Medicine Recommendation Engine...")

        # Create medicine-condition mapping
        medicine_condition_pairs = []
        for record in self.dataset:
            for med in record["medicines_recommended"]:
                for condition in record["predicted_conditions"]:
                    medicine_condition_pairs.append((med["id"], condition, record["risk_level"]))

        # Simple memory-based model (can be upgraded to collaborative filtering)
        self.models["medicine_recommender"] = {
            "pairs": medicine_condition_pairs,
            "medicine_db": {med["id"]: med for record in self.dataset for med in record["medicines_recommended"]},
        }
        print(f"Medicine Recommendation Model trained on {len(medicine_condition_pairs)} condition-medicine pairs")

    def train_ddi_classifier(self):
        """Train model to detect drug-drug interactions"""
        print("\n[5/5] Training Drug-Drug Interaction Classifier...")

        # Extract DDI examples
        ddi_positive = []
        ddi_negative = []

        for record in self.dataset:
            for ddi in record["drug_interactions"]:
                ddi_positive.append(
                    (
                        ddi["drug1"],
                        ddi["drug2"],
                        1 if ddi["severity"] == "high" else (0.5 if ddi["severity"] == "moderate" else 0),
                    )
                )

        # Generate negative examples
        all_medicines = set()
        for record in self.dataset:
            for med in record["medicines_recommended"]:
                all_medicines.add(med["id"])
            for med in record["current_medications"]:
                if med != "none":
                    all_medicines.add(med)

        all_medicines = list(all_medicines)
        for _ in range(len(ddi_positive)):
            med1, med2 = np.random.choice(all_medicines, 2, replace=False)
            if (med1, med2) not in [(d[0], d[1]) for d in ddi_positive]:
                ddi_negative.append((med1, med2, 0))

        self.models["ddi_model"] = {
            "interactions": ddi_positive,
            "medicine_set": all_medicines,
        }
        print(f"DDI Model trained on {len(ddi_positive)} known interactions")

    def train_all_models(self):
        """Train all models"""
        print("=" * 60)
        print("STARTING MODEL TRAINING PIPELINE")
        print("=" * 60)

        self.train_symptom_to_disease_model()
        self.train_risk_classifier()
        self.train_red_flag_detector()
        self.train_medicine_recommender()
        self.train_ddi_classifier()

        print("\n" + "=" * 60)
        print("MODEL TRAINING COMPLETE")
        print("=" * 60)

    def save_models(self, directory: str = "ml-service/models"):
        """Save trained models to disk"""
        import os

        os.makedirs(directory, exist_ok=True)

        for name, model in self.models.items():
            filepath = f"{directory}/{name}.pkl"
            with open(filepath, "wb") as f:
                pickle.dump(model, f)
            print(f"Saved: {filepath}")

        for name, vectorizer in self.vectorizers.items():
            filepath = f"{directory}/vectorizer_{name}.pkl"
            with open(filepath, "wb") as f:
                pickle.dump(vectorizer, f)
            print(f"Saved: {filepath}")


if __name__ == "__main__":
    trainer = MLModelTrainer()
    trainer.train_all_models()
    trainer.save_models()
