export interface Study {
    ID: string;
    IsStable: boolean;
    MainDicomTags : {
       AccessionNumber : string;
       InstitutionName : string;
       ReferringPhysicianName : string;
       RequestedProcedureDescription : string;
       RequestingPhysician : string;
       StudyDate : string;
       StudyDescription : string;
       StudyID : string;
       StudyInstanceUID : string;
       StudyTime : string;
    };
    ParentPatient : string;
    PatientMainDicomTags : {
       PatientBirthDate : string;
       PatientID : string;
       PatientName : string;
       PatientSex : string;
    };
    Series : string[];
    Type : string
}