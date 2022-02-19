import { ModelManifestItem } from "med-ai-common";
import { StudyType, Modality, ModelInputs, ModelOutputs } from "med-ai-common";

export const ModelManifest: ModelManifestItem[] = [
    {
        tag: 'tclarke104/ich-model:0.1',
        displayName: 'Intracranial Hemorrhage Detection',
        input: StudyType.CT,
        modality: Modality.CT,
        inputType: ModelInputs.DICOM,
        output: ModelOutputs.classProbabilities,
        hasImageOutput: false,
        outputKeys: [
            'epidural', 
            'subdural', 
            'subarachnoid', 
            'cranial bleed',
            'intraparenchymal',
            'intraventricular'
        ]
    },
    {
        tag: 'tclarke104/ich-model-single:0.1',
        displayName: 'Intracranial Hemorrhage Detection Single Slice detection',
        input: StudyType.CT,
        modality: Modality.CT,
        inputType: ModelInputs.DICOM,
        output: ModelOutputs.classProbabilities,
        hasImageOutput: false,
        outputKeys: [
            'epidural', 
            'subdural', 
            'subarachnoid', 
            'cranial bleed',
            'intraparenchymal',
            'intraventricular'
        ]
    },
    {
        tag: 'tclarke104/ich-model-revised:0.1',
        displayName: 'Intracranial Hemorrhage Detection Revised',
        input: StudyType.CT,
        modality: Modality.CT,
        inputType: ModelInputs.DICOM,
        output: ModelOutputs.classProbabilities,
        hasImageOutput: false,
        outputKeys: [
            'epidural', 
            'subdural', 
            'subarachnoid', 
            'any',
            'intraparenchymal',
            'intraventricular'
        ]
    },
    {
        tag: 'tclarke104/cxr-classifier:0.1',
        displayName: 'Chest X-Ray Classifier',
        input: StudyType.dicom,
        modality: Modality.C_XRAY,
        inputType: ModelInputs.DICOM,
        output: ModelOutputs.classProbabilities,
        hasImageOutput: false,
        outputKeys: []
    },
    {
        tag: 'tclarke104/ptx-model:0.1',
        displayName: 'Pneumothorax Detection',
        input: StudyType.frontalCXR,
        modality: Modality.C_XRAY,
        inputType: ModelInputs.DICOM,
        output: ModelOutputs.classProbabilities,
        hasImageOutput: true,
        outputKeys: []
    },    
    {
        tag: 'tclarke104/pneumonia-model:0.1',
        displayName: 'Pneumonia Detection',
        input: StudyType.frontalCXR,
        modality: Modality.C_XRAY,
        inputType: ModelInputs.DICOM,
        output: ModelOutputs.classProbabilities,
        hasImageOutput: true,
        outputKeys: []
    },
    {
        tag: 'tclarke104/pe-model:0.1',
        displayName: 'PE Detection',
        input: StudyType.CT,
        modality: Modality.CT,
        inputType: ModelInputs.DICOM,
        output: ModelOutputs.classProbabilities,
        hasImageOutput: false,
        outputKeys: []
    },
]