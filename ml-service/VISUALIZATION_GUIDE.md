# IEEE-Conference-Ready Data Visualization Guide
## AarogyaGuard ML Models Analysis

---

## Overview
This guide documents the IEEE-conference-ready visualization system for the AarogyaGuard healthcare assistant ML models. All visualizations are generated without modifying existing model logic and are optimized for publication in peer-reviewed venues.

---

## Quick Start

### Generate All Visualizations
```bash
cd /path/to/healthcare-assistant-app_0.4
python ml-service/model_visualizations.py
```

### Output Location
All generated graphs are saved to: **`ml-service/graphs/`**

---

## Generated Visualizations

### GRAPH 1: Disease Distribution
**Filename:** `01_disease_distribution.png`

**Purpose:**  
Illustrates the distribution of 15 different medical conditions in the training dataset, showing which diseases/conditions are most prevalent in the patient population.

**Technical Details:**
- **Data Source:** Extracted from RandomForestClassifier model classes from `symptom_disease.pkl`
- **Fallback:** If model classes unavailable, reconstructed from `synthetic_data.json`
- **Format:** Horizontal bar chart (15 conditions)
- **Resolution:** 300 DPI PNG
- **File Size:** ~180-210 KB

**IEEE Paper Mapping:**
```
Section: Results / Dataset Analysis
- Shows disease prevalence in training data
- Justifies model selection and class imbalance handling
- Demonstrates dataset coverage across medical conditions
```

**Key Conditions Tracked:**
- Asthma, Pneumonia, Bronchitis, Influenza, Common Cold
- Gastroenteritis, Migraine, Hypertension, Diabetes
- Heart Disease, Arthritis, Anemia, GERD, etc.

---

### GRAPH 2: Symptom Feature Importance
**Filename:** `02_symptom_feature_importance.png`

**Purpose:**  
Displays the top 20 most discriminative symptom features extracted from the TF-IDF vectorizer, demonstrating which symptoms carry the highest clinical significance for disease classification.

**Technical Details:**
- **Data Source:** `vectorizer_symptom_text.pkl` (TF-IDF Vectorizer)
- **Features Analyzed:** 500 total features (top 20 selected)
- **Metric:** IDF (Inverse Document Frequency) weights
- **Format:** Horizontal bar chart with score annotations
- **Resolution:** 300 DPI PNG
- **File Size:** ~290-300 KB

**IEEE Paper Mapping:**
```
Section: Methods / Feature Engineering
- Demonstrates NLP preprocessing quality
- Shows symptom tokenization effectiveness
- Justifies feature selection approach
- Highlights clinically relevant symptom terms
```

**Interpretation:**
Lower IDF scores indicate terms common across many documents (less discriminative).  
Higher IDF scores indicate rare, specialized terms (highly discriminative).

**Example Top Features:**
- "fever", "cough", "chest_pain", "shortness_of_breath"
- "pneumonia", "asthma", "inflammation", etc.

---

### GRAPH 3: Risk Classifier Confusion Matrix
**Filename:** `03_risk_confusion_matrix.png`

**Purpose:**  
Shows the performance of the risk level classifier across three risk categories (Low, Medium, High), revealing classification accuracy and common misclassification patterns.

**Technical Details:**
- **Model:** GradientBoostingClassifier from `risk_classifier.pkl`
- **Classes:** 3 categories (Low, Medium, High risk levels)
- **Data:** Reconstructed from first 250 records in `synthetic_data.json`
- **Features:** 
  - Number of extracted symptoms
  - Patient age
- **Format:** 3×3 confusion matrix heatmap with counts
- **Resolution:** 300 DPI PNG
- **File Size:** ~110 KB

**IEEE Paper Mapping:**
```
Section: Results / Model Performance
- Demonstrates classifier accuracy per risk category
- Shows classification errors and confusion patterns
- Justifies model selection (Gradient Boosting)
- Explains true positive/false positive rates
```

**Matrix Interpretation:**
- Diagonal: Correct predictions
- Off-diagonal: Misclassifications
- Color intensity: Number of samples
- Helps identify bias toward specific risk levels

---

### GRAPH 4: Red Flag Detection Output Distribution
**Filename:** `04_red_flag_distribution.png`

**Purpose:**  
Visualizes the distribution of red-flag detection outcomes (Red Flag Detected vs. No Red Flag) across all 10,000 patient cases, showing the prevalence of emergency symptoms.

**Technical Details:**
- **Data Source:** `red_flags` field from `synthetic_data.json`
- **Sample Size:** 10,000 consultation records
- **Categories:** 
  - Red Flag Detected (emergency conditions)
  - No Red Flag (stable conditions)
- **Format:** Clustered bar chart with counts and percentages
- **Resolution:** 300 DPI PNG
- **File Size:** ~115-120 KB
- **Colors:** Red (#E63946) for red flags, Green (#06A77D) for safe conditions

**IEEE Paper Mapping:**
```
Section: Results / Clinical Significance
- Demonstrates prevalence of emergency symptoms
- Shows dataset balance/imbalance for emergency detection
- Justifies emergency detection model importance
- Supports necessity of triage system
```

**Red Flag Symptoms Include:**
- Chest pain, Shortness of breath
- Loss of consciousness
- Uncontrolled bleeding
- Severe allergic reactions

---

## Technical Architecture

### Data Flow
```
Trained Models (.pkl files)
    ↓
Model Visualizer (model_visualizations.py)
    ├─ Load vectorizers (TF-IDF, encoders)
    ├─ Load trained classifiers (RF, GB, LR)
    ├─ Extract features/labels
    └─ Generate Graphs
    ↓
IEEE-Ready PNG Figures (300 DPI)
```

### Models Used

| Model File | Type | Purpose | Used In |
|---|---|---|---|
| `symptom_disease.pkl` | RandomForestClassifier | Disease classification | Graph 1, 2 |
| `vectorizer_symptom_text.pkl` | TfidfVectorizer | Text→Features | Graph 2 |
| `risk_classifier.pkl` | GradientBoostingClassifier | Risk level prediction | Graph 3 |
| `red_flag_detector.pkl` | LogisticRegression | Emergency detection | (Inference) |
| `medicine_recommender.pkl` | Rule-based | Medicine suggestion | (Inference) |
| `ddi_model.pkl` | Interaction database | Drug-drug interaction | (Inference) |

### Model Loading Strategy
```python
# Automatic path discovery
1. Check: ml-service/models/
2. Fallback: models/
3. Display warning if not found
```

---

## IEEE Publication Quality Standards

All visualizations meet IEEE conference requirements:

✅ **High Resolution:** 300 DPI PNG format  
✅ **Professional Styling:** Clean, minimal design  
✅ **Matplotlib Only:** No external visualization libraries  
✅ **Clear Labels:** Descriptive titles, axis labels, legends  
✅ **No Interactive Elements:** Static PNG for paper reproduction  
✅ **Modular Code:** Easy to extend or modify  
✅ **Error Handling:** Graceful degradation with meaningful logs  
✅ **Reproducible:** Run independently: `python model_visualizations.py`  

---

## Integration with Papers

### Typical Paper Structure

```
Abstract
Introduction
Related Work
    ↓
Methods / Proposed Approach
    → Figure 2: Symptom Feature Importance
    → Describe NLP pipeline validation
    
Dataset
    → Figure 1: Disease Distribution
    → Explain data collection & preprocessing
    
Results
    → Figure 3: Risk Classifier Confusion Matrix
    → Figure 4: Red Flag Detection Distribution
    → Present performance metrics & analysis
    
Discussion
    → Interpret clinical significance
    → Discuss edge cases from confusion matrix
    
Conclusion
    → Summarize findings & visualizations
```

---

## Customization Guide

### Modifying Graph Appearance

Edit in `model_visualizations.py`:

```python
# Change colors
color = "#2E86AB"  # Blue
color = "#A23B72"  # Purple
color = "#06A77D"  # Green

# Change DPI
self._save_figure(filename, fig, dpi=600)  # Higher quality

# Change figure size
fig, ax = plt.subplots(figsize=(12, 8), dpi=100)  # Larger figure

# Add/remove grid
ax.grid(axis="x", alpha=0.3, linestyle="--")
```

### Extending to New Visualizations

```python
def generate_custom_visualization(self) -> bool:
    """Add new graph generation method"""
    self.logger.info("Generating CUSTOM GRAPH")
    
    # Load data & models
    data = self._load_synthetic_data()
    
    # Create figure
    fig, ax = plt.subplots(figsize=(10, 6), dpi=100)
    
    # Plot (your code here)
    ax.plot(data)
    
    # Save with IEEE quality
    self._save_figure("05_custom_graph.png", fig)
    plt.close(fig)
    
    return True
```

---

## Troubleshooting

### Issue: "Models directory not found"
**Solution:** Ensure trained models exist:
```bash
python ml-service/model_trainer.py  # Train models first
```

### Issue: Graphs not appearing in output directory
**Solution:** Check directory permissions:
```bash
ls -la ml-service/graphs/
```

### Issue: "Vectorizer not found" for Graph 2
**Solution:** Ensure `model_trainer.py` completed successfully with:
```
Saved: ml-service/models/vectorizer_symptom_text.pkl
```

### Issue: Confusion matrix shows different classes
**Solution:** This is normal - depends on actual risk level distribution in data. Use `classification_report()` for detailed metrics.

---

## Performance Specifications

| Graph | Generation Time | File Size | Memory Usage |
|---|---|---|---|
| Graph 1 (Disease) | ~1s | ~180-210 KB | Low |
| Graph 2 (Features) | ~1s | ~290-300 KB | Medium |
| Graph 3 (Confusion) | ~2s | ~110 KB | Medium |
| Graph 4 (Red Flag) | ~1s | ~115-120 KB | Low |
| **Total Pipeline** | **~5 seconds** | **~700 KB** | **Medium** |

---

## Bibliography References

When citing these visualizations in papers:

```bibtex
@software{aarogyaguard2026,
  title={AarogyaGuard: IEEE-Conference-Ready ML Visualization System},
  author={Healthcare Assistant Project},
  year={2026},
  note={Visualization framework for trained medical AI models}
}
```

---

## Future Enhancements

- [ ] ROC curves for binary classifiers
- [ ] Feature importance from Random Forest
- [ ] Training history (loss curves)
- [ ] Model comparison visualizations
- [ ] Confidence interval bands
- [ ] Multi-class precision-recall curves
- [ ] Saliency maps for interpretability

---

## License & Attribution

This visualization system is designed to support academic and research applications. All visualizations are generated from existing model predictions without retraining or modifying model logic.

**Not to be modified for production without explicit authorization.**

---

*Last Updated: February 7, 2026*  
*System: AarogyaGuard Healthcare Assistant v0.4*
