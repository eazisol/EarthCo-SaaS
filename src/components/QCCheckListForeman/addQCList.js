import React, { useEffect, useContext, useState } from "react";
import TitleBar from "../TitleBar";
import {
    Autocomplete,
    TextField,
    FormControl,
    MenuItem,
    Select,
    Modal,
    Box,
    IconButton,
} from "@mui/material";
import Cookies from "js-cookie";
import { Delete,  Close } from "@mui/icons-material";
import axios from "axios";
import EventPopups from "../Reusable/EventPopups";
import { useNavigate } from "react-router-dom";
import formatDate from "../../custom/FormatDate";
import LoaderButton from "../Reusable/LoaderButton";
import { DataContext } from "../../context/AppData";
import CircularProgress from "@mui/material/CircularProgress";
import useDeleteFile from "../Hooks/useDeleteFile";
import BackButton from "../Reusable/BackButton";
import { baseUrl } from "../../apiConfig";
import CustomerAutocomplete from "../Reusable/CustomerAutocomplete";
import imageCompresser from "../../custom/ImageCompresser";
import dayjs from "dayjs";
import RadioOption from "../Reusable/RadioOption";
export const AddQCList = () => {
    const token = Cookies.get("token");
    const headers = {
        Authorization: `Bearer ${token}`,
    };

    let currentMonth = new Date().toLocaleString("default", { month: "long" });
    const queryParams = new URLSearchParams(window.location.search);
    const idParam = Number(queryParams.get("id"));
    const [currentErrorIndex, setCurrentErrorIndex] = useState(null);
    const navigate = useNavigate();
    const [statusList, setStatusList] = useState([]);
    const deleteSavedPhoto = async (photoId, questionKey, photoType) => {
        try {
            const response = await axios.get(
                `${baseUrl}/api/ForemanQCChecklist/DeleteForemanQCChecklistFile?FileId=${photoId}`,
                { headers }
            );
            
            if (response.status === 200) {
                setQuestionFiles((prevFiles) => {
                    const updatedFiles = { ...prevFiles };
                    if (updatedFiles[photoType]) {
                        updatedFiles[photoType] = updatedFiles[photoType].filter(
                            file => file.photoId !== photoId
                        );
                    }
                    return updatedFiles;
                });
                
                setOpenSnackBar(true);
                setSnackBarColor("success");
                setSnackBarText(isSpanish ? "Foto eliminada exitosamente" : "Photo deleted successfully");
            }
        } catch (error) {
            console.error("Error deleting photo:", error);
            setOpenSnackBar(true);
            setSnackBarColor("error");
            setSnackBarText(isSpanish ? "Error al eliminar la foto" : "Error deleting photo");
        }
    };

    const { loggedInUser, companyInfo, setselectedPdf } = useContext(DataContext);

    const currentDate = new Date();
    const currentTime = dayjs();
    const [formData, setFormData] = useState({
        ForemanQCChecklistFormId: 0,
        CustomerId: null,
        ForemanUserId: "",
        ReportDate: formatDate(currentDate),
        StatusId: 1,
        q1: "no",
        q2: "no",
        q3: "no",
        q4: "no",
        q4a: "no",
        q5: "no",
        q6: "no",
        q7: "no",
        q8: "no",
        q9: "no",
        q10: "no",
        q11: "no",
        q12: "",
        q13: "",
        ForemanQCChecklistFormStatusId: 1,
        isTemplate: false,
    });
    const [staffData, setStaffData] = useState([]);

    const [Files, setFiles] = useState([]);
    const [questionFiles, setQuestionFiles] = useState({});
    const [openSnackBar, setOpenSnackBar] = useState(false);
    const [snackBarColor, setSnackBarColor] = useState("");
    const [snackBarText, setSnackBarText] = useState("");
    const [photoValidationErrors, setPhotoValidationErrors] = useState([]);
    const [photoErrorAlertOpen, setPhotoErrorAlertOpen] = useState([]);
    const [questionsWithErrors, setQuestionsWithErrors] = useState(new Set());
    
    // Image modal state
    const [imageModalOpen, setImageModalOpen] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);

    // Functions to handle image modal
    const openImageModal = (imageUrl, imageName) => {
        setSelectedImage({ url: imageUrl, name: imageName });
        setImageModalOpen(true);
    };

    const closeImageModal = () => {
        setImageModalOpen(false);
        setSelectedImage(null);
    };

    const [loading, setLoading] = useState(true);
    const [loadingStatus, setLoadingStatus] = useState(true);

    const [isSpanish, setIsSpanish] = useState(false);
    const [hasOpenForms, setHasOpenForms] = useState(false);
    const checkOpenForms = async () => {
        if (!formData.ForemanUserId || idParam) return;
        try {
            const response = await axios.get(
                `${baseUrl}/api/ForemanQCChecklist/GetOpenFormsByForeman?foremanId=${formData.ForemanUserId}`,
                { headers }
            );

            if (response.data?.length > 0) {
                setHasOpenForms(true);
                setOpenSnackBar(true);
                setSnackBarColor("warning");
                setSnackBarText(
                    isSpanish
                        ? "Tienes formularios abiertos que deben cerrarse antes de crear uno nuevo."
                        : "You have open forms that must be closed before creating a new one."
                );
            } else {
                setHasOpenForms(false);
            }
        } catch (error) {
            console.log("Error checking open forms:", error);
            // Don't block if API fails
            setHasOpenForms(false);
        }
    };


    const getQCFormData = async () => {
        if (!idParam) {
            setLoading(false);
            return;
        }
        try {
            const res = await axios.get(
                `${baseUrl}/api/ForemanQCChecklist/GetForemanQCChecklistForm?id=${idParam}`,
                { headers }
            );
            if (res.data?.Data) {
                const apiData = res.data.Data;
                const mappedFormData = {
                    CustomerDisplayName: res.data.Data.CustomerDisplayName,
                    ForemanQCChecklistFormId: apiData.ForemanQCChecklistFormId,
                    CustomerId: apiData.CustomerId,
                    ForemanUserId: apiData.ForemanId,
                    ReportDate: apiData.ReportDate ? apiData.ReportDate.split("T")[0] : formatDate(new Date()),
                    StatusId: apiData.ForemanQCChecklistFormStatusId || 1,
                    q1: apiData.HighProfileAreasChecked == null ? null : apiData.HighProfileAreasChecked ? "yes" : "no",
                    q2: apiData.ColorChecked == null ? null : apiData.ColorChecked ? "yes" : "no",
                    q3: apiData.JobPatrolledForTrash == null ? null : apiData.JobPatrolledForTrash ? "yes" : "no",
                    q4: apiData.PropertyFreeOfDeadPlants == null ? null : apiData.PropertyFreeOfDeadPlants ? "yes" : "no",
                    q4a: apiData.DeadPlantsReported == null ? null : apiData.DeadPlantsReported ? "yes" : "no",
                    q5: apiData.WeedsRemovedSidewalk == null ? null : apiData.WeedsRemovedSidewalk ? "yes" : "no",
                    q6: apiData.TurfConditionOk == null ? null : apiData.TurfConditionOk ? "yes" : "no",
                    q7: apiData.PlantsAdequatelyWatered == null ? null : apiData.PlantsAdequatelyWatered ? "yes" : "no",
                    q8: apiData.NewPlantsSufficientWater == null ? null : apiData.NewPlantsSufficientWater ? "yes" : "no",
                    q9: apiData.IrrigationSystemOk == null ? null : apiData.IrrigationSystemOk ? "yes" : "no",
                    q10: apiData.FocalAreasMulched == null ? null : apiData.FocalAreasMulched ? "yes" : "no",
                    q11: apiData.PropertyFreeOfFallenTrees == null ? null : apiData.PropertyFreeOfFallenTrees ? "yes" : "no",
                    q12: apiData.CurrentRotation || "",
                    q13: apiData.NextWeekRotation || "",

                    ForemanQCChecklistFormStatusId: apiData.ForemanQCChecklistFormStatusId || 1,
                    isTemplate: apiData.isTemplate || false,
                };

                setFormData(mappedFormData);
                if (res.data?.PhotosData && Array.isArray(res.data.PhotosData)) {
                    const photosGroupedByQuestion = {};

                    res.data.PhotosData.forEach((photo) => {
                        const baseQuestionKey = getQuestionKeyFromId(photo.QuestionKey);
                        const questionKey = `${baseQuestionKey}${photo.isAfterPhoto ? 'After' : ''}`;

                        if (!photosGroupedByQuestion[questionKey]) {
                            photosGroupedByQuestion[questionKey] = [];
                        }

                        // Create photo object for display
                        const photoObj = {
                            name: photo.PhotoPath.split('\\').pop(), // Get filename
                            url: `${baseUrl}/${photo.PhotoPath.replace(/\\/g, '/')}`, // Convert to URL
                            isExisting: true, // Mark as existing so it won't be re-uploaded
                            photoId: photo.ForemanQCChecklistFormPhotoId,
                            questionKey: baseQuestionKey,
                            isAfterPhoto: photo.isAfterPhoto
                        };

                        photosGroupedByQuestion[questionKey].push(photoObj);
                    });

                    setQuestionFiles(photosGroupedByQuestion);
                }
            }
            setLoading(false);
        } catch (error) {
            setLoading(false);
            console.log("api call error", error);
        }
    };
    const fetchStatusList = async () => {
        try {
            const response = await axios.get(
                `${baseUrl}/api/ForemanQCChecklist/GetForemanQCChecklistStatusList`,
                { headers }
            );
            setStatusList(response.data);
        } catch (error) {
            console.error("Error fetching status list:", error);
            setStatusList([]);
        }
    };

    useEffect(() => {
        fetchStatusList();
    }, []);
    const fetchStaffList = async () => {
        try {
            const response = await axios.get(`${baseUrl}/api/Staff/GetStaffList`, {
                headers,
            });
            setStaffData(response.data);
        } catch (error) {
            console.log("error getting staff list", error);
        }
    };
    useEffect(() => {
        if (!formData.RegionalManagerId) {
            if (loggedInUser.userRole === "4") {
                setFormData((prevData) => ({
                    ...prevData,
                    RegionalManagerId: Number(loggedInUser.userId),
                }));
            }
        }
        fetchStaffList();
        // eslint-disable-next-line
    }, []);
    useEffect(() => {
        // eslint-disable-next-line
    }, [formData.ContactId]);

    // Check for open forms when foreman is selected
    useEffect(() => {
        if (formData.ForemanUserId && !idParam) {
            checkOpenForms();
        }
        // eslint-disable-next-line
    }, [formData.ForemanUserId]);

    // --- FIX: handleInputChange to allow manual status change and keep in sync ---
    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;

        // If the status select is changed, update both status fields and do NOT call updateFormStatus (which would override)
        if (name === "ForemanQCChecklistFormStatusId" || name === "StatusId") {
            setFormData((prevData) => ({
                ...prevData,
                ForemanQCChecklistFormStatusId: Number(value),
                StatusId: Number(value),
            }));
            return;
        }

        const adjustedValue = ["CustomerId", "ForemanId", "StatusId"].includes(name)
            ? Number(value)
            : type === "checkbox"
            ? checked
            : value;

        setFormData((prevData) => ({
            ...prevData,
            [name]: adjustedValue,
        }));

        // Only auto-update status if not changing status field directly
        updateFormStatus(name, adjustedValue);
    };
    // ------------------------------------------------------------------------------

    const handleQuestionFileUpload = async (e, questionName) => {
        const uploadedFile = e.target.files[0];
        if (uploadedFile) {
            // Check if already have 3 images for this question
            const currentImages = questionFiles[questionName] || [];
            if (currentImages.length >= 3) {
                setOpenSnackBar(true);
                setSnackBarColor("warning");
                setSnackBarText(
                    isSpanish
                        ? "Máximo 3 imágenes permitidas por pregunta"
                        : "Maximum 3 images allowed per question"
                );
                return;
            }

            const newFileName = `QC_${questionName}_${uploadedFile.name}`;
            const renamedFile = new File([uploadedFile], newFileName, {
                type: uploadedFile.type,
                lastModified: uploadedFile.lastModified,
            });

            const compressedImg = await imageCompresser(renamedFile);
            setQuestionFiles((prevFiles) => ({
                ...prevFiles,
                [questionName]: [...(prevFiles[questionName] || []), compressedImg],
            }));
            
            // Clear error state for this question if it was in error
            const baseQuestionKey = questionName.replace('After', '').replace('_evidence', '');
            if (questionsWithErrors.has(baseQuestionKey)) {
                setQuestionsWithErrors(prev => {
                    const newSet = new Set(prev);
                    newSet.delete(baseQuestionKey);
                    return newSet;
                });
            }
        }
    };
    const calculateStatusId = () => {
        const criticalQuestions = ["q1", "q2", "q4", "q6", "q7", "q9", "q11"];
        const hasNoAnswersWithoutAfterPhotos = criticalQuestions.some(questionKey => {
            if (formData[questionKey] === "no") {
                const question = qcQuestions.find(q => q.key === questionKey);
                if (question?.onNoPhoto) {
                    const afterPhotos = questionFiles[`${questionKey}After`] || [];
                }
                return true;
            }
            return false;
        });
        if (hasNoAnswersWithoutAfterPhotos) {
            return 2;
        }
        const allQuestions = ["q1", "q2", "q3", "q4", "q5", "q6", "q7", "q8", "q9", "q10", "q11"];
        const allQuestionsResolved = allQuestions.every(questionKey => {
            if (formData[questionKey] === "yes") {
                return true;
            }
            if (formData[questionKey] === "no") {
                const question = qcQuestions.find(q => q.key === questionKey);
                if (question?.onNoPhoto) {
                    const afterPhotos = questionFiles[`${questionKey}After`] || [];
                    return afterPhotos.length > 0;
                }
                return false;
            }
            return false;
        });
        if (allQuestionsResolved && formData.q12 && formData.q13) {
            return 4;
        }

        return 1;
    };

    const getQuestionId = (questionKey) => {
        const questionMap = {
            "q1": 1, "q2": 2, "q3": 3, "q4": 4, "q4a": 5,
            "q5": 6, "q6": 7, "q7": 8, "q8": 9, "q9": 10,
            "q10": 11, "q11": 12
        };
        return questionMap[questionKey] || 0;
    };

    const getQuestionKeyFromId = (questionId) => {
        const idToKeyMap = {
            1: "q1", 2: "q2", 3: "q3", 4: "q4", 5: "q4a",
            6: "q5", 7: "q6", 8: "q7", 9: "q8", 10: "q9",
            11: "q10", 12: "q11"
        };
        return idToKeyMap[questionId] || "";
    };

    // Function to update form status based on answers
    const updateFormStatus = (fieldName, value) => {
        // Don't auto-update if the field changed is the status field itself
        if (fieldName === "ForemanQCChecklistFormStatusId" || fieldName === "StatusId") {
            return;
        }
        // Update status dynamically
        const newStatus = calculateStatusId();
        setFormData((prevData) => ({
            ...prevData,
            StatusId: newStatus,
            ForemanQCChecklistFormStatusId: newStatus,
        }));
    };
    const [disableButton, setDisableButton] = useState(false);

    const handleSubmit = async () => {
        // if (!formData.CustomerId) {
        //     setOpenSnackBar(true);
        //     setSnackBarColor("error");
        //     setSnackBarText(isSpanish ? "Por favor seleccione un cliente" : "Please select a customer");
        //     return;
        // }

        // if (!formData.ForemanUserId) {
        //     setOpenSnackBar(true);
        //     setSnackBarColor("error");
        //     setSnackBarText(isSpanish ? "Por favor seleccione un mayordomo" : "Please select a foreman");
        //     return;
        // }
        // const errors = [];
        // const errorQuestions = new Set();

        // for (let i = 0; i < qcQuestions.length; i++) {
        //     const question = qcQuestions[i];
        //     if (question.subQuestion && formData[question.dependsOn] !== question.showWhen) {
        //         continue;
        //     }
        //     if (question.requiresPhoto && formData[question.key] === "yes") {
        //         const photos = questionFiles[question.key] || [];
        //         const minRequired = question.minPhotos || 1;

        //         if (photos.length < minRequired) {
        //             errors.push(
        //                 `${isSpanish ? "Pregunta" : "Question"} ${isSpanish ? `Requiere ${minRequired} foto mínimo` : `Requires minimum ${minRequired} photo`}`
        //             );
        //             errorQuestions.add(question.key);
        //             setOpenSnackBar(true);
        //             setSnackBarColor("error");
        //             setSnackBarText(isSpanish ? `Requiere ${minRequired}    foto mínimo` : `Requires minimum ${minRequired} photo`);
        //             setQuestionsWithErrors(errorQuestions);
        //             return;
        //         }
        //     }
        //     if (question.onNoPhoto && formData[question.key] === "no") {
        //         const evidencePhotos = questionFiles[`${question.key}_evidence`] || [];

        //         if (evidencePhotos.length === 0) {
        //             errors.push(
        //                 `${isSpanish ? "" : "Point"} ${i + 1}: ${isSpanish ? "Requiere foto de evidencia" : "Requires after photo"}`
        //             );
        //             errorQuestions.add(question.key);
        //             setOpenSnackBar(true);
        //             setSnackBarColor("error");
        //             setSnackBarText(isSpanish ? `Requiere foto de evidencia` : `Requires after photo`);
        //             setQuestionsWithErrors(errorQuestions);
        //             return;
        //         }
        //     }
        // }

        // if (errors.length > 0) {
        //     setPhotoValidationErrors(errors);
        //     setCurrentErrorIndex(0);
        //     return;
        // } else {
        //     setQuestionsWithErrors(new Set()); // Clear all errors if validation passes
        // }
        const statusId = formData.ForemanQCChecklistFormStatusId || calculateStatusId();

        const dynamicPayloadData = {
            ForemanQCChecklistFormId: idParam || 0,
            CustomerId: formData.CustomerId,
            ReportDate: formData.ReportDate,
            ForemanId: formData.ForemanUserId,
            ForemanQCChecklistFormStatusId: statusId,
            HighProfileAreasChecked: formData.q1 === "yes" || false,
            ColorChecked: formData.q2 === "yes" || false,
            JobPatrolledForTrash: formData.q3 === "yes" || false,
            PropertyFreeOfDeadPlants: formData.q4 === "yes" || false,
            DeadPlantsReported: formData.q4a === "yes" || false,
            WeedsRemovedSidewalk: formData.q5 === "yes" || false,
            TurfConditionOk: formData.q6 === "yes" || false,
            PlantsAdequatelyWatered: formData.q7 === "yes" || false,
            NewPlantsSufficientWater: formData.q8 === "yes" || false,
            IrrigationSystemOk: formData.q9 === "yes" || false,
            FocalAreasMulched: formData.q10 === "yes" || false,
            PropertyFreeOfFallenTrees: formData.q11 === "yes" || false,
            CurrentRotation: formData.q12 || "",
            NextWeekRotation: formData.q13 || ""
        };

        const formDataObj = new FormData();
        formDataObj.append('ForemanQCChecklistFormData', JSON.stringify(dynamicPayloadData));
        let idsArray = [];
        let totalFilesCount = 0;
        Object.keys(questionFiles).forEach((questionKey) => {
            const questionImages = questionFiles[questionKey];
            if (questionImages && questionImages.length > 0) {
                questionImages.forEach((image, index) => {
                    if (!image.isExisting) {
                        formDataObj.append('Files', image);
                        let isAfterPhoto = false;
                        let baseQuestionKey = questionKey;

                        if (questionKey.includes('After')) {
                            isAfterPhoto = true;
                            baseQuestionKey = questionKey.replace('After', '');
                        } else if (questionKey.includes('_evidence')) {
                            isAfterPhoto = false;
                            baseQuestionKey = questionKey.replace('_evidence', '');
                        }

                        const questionId = getQuestionId(baseQuestionKey);
                        idsArray.push({
                            id: questionId,
                            isAfterPhoto: isAfterPhoto
                        });
                        totalFilesCount++;
                    } else {
                        // Skipped existing image
                    }
                });
            }
        });
        Files.forEach((file) => {
            formDataObj.append('Files', file);
            totalFilesCount++;
        });

        if (idsArray.length > 0) {
            formDataObj.append('ids[]', JSON.stringify(idsArray));
        }

        setDisableButton(true);

        try {
            const axiosConfig = {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "multipart/form-data",
                    Accept: "application/json",
                },
                timeout: 30000,
            };
            const response = await axios.post(
                `${baseUrl}/api/ForemanQCChecklist/AddForemanQCChecklistForm`,
                formDataObj,
                axiosConfig
            );
            if (response.data) {
                const isUpdate = idParam && idParam !== 0;
                setOpenSnackBar(true);
                setSnackBarColor("success");
                setSnackBarText(response.data.Message);
                if (response.data.Id) {
                    navigate(`/qc-checklist-foreman/add?id=${response.data.Id}`);
                    setTimeout(() => {
                        setDisableButton(false);
                        window.location.reload();
                    }, 2000);
                } else {
                    setDisableButton(false);
                }
            }
        } catch (error) {
            setDisableButton(false);
            setOpenSnackBar(true);
            setSnackBarColor("error");
            setSnackBarText(error.response?.data || "An error occurred.");
        }
        for (let [key, value] of formDataObj.entries()) {
            // console.log("FormData:", key, value);
        }
    };

    useEffect(() => {
        fetchStaffList();
        getQCFormData();
    }, []);

    useEffect(() => {
        if (idParam) {
            getQCFormData();
        }
    }, [idParam]);


    const handleAutocompleteChange = (
        fieldName,
        valueProperty,
        event,
        newValue
    ) => {
        const simulatedEvent = {
            target: {
                name: fieldName,
                value: newValue ? newValue[valueProperty] : "",
            },
        };

        handleInputChange(simulatedEvent);
    };

    // QC Checklist Questions in English and Spanish (using mobile app field names)
    const qcQuestions = [
        {
            key: "q1",
            questionId: 1,
            english: "Were high profile areas checked for weeds and trash - entries, pools, clubhouses and focal corners?",
            spanish: "¿Se revisaron las áreas de alto perfil (entradas, albercas, casa club y esquinas) que no haya basura ni maleza?",
            requiresPhoto: true,
            minPhotos: 2,
        },
        {
            key: "q2",
            questionId: 2,
            english: "Was color checked for weeds and trash?  (If there is no color select yes and take photos of the focal points)",
            spanish: "¿Se revisaron las áreas con plantas de color que no haya basura ni maleza? (si no hay areas de color seleccione Si; tome fotos del area)",
            requiresPhoto: true,
            minPhotos: 2,
        },
        {
            key: "q3",
            questionId: 3,
            english: "Was the entire job patrolled for trash (not just current rotation)?",
            spanish: "¿Se patrulló toda la propiedad para recoger basura? (No solo el área donde se encuentra trabajando)",
            requiresPhoto: false,
        },
        {
            key: "q4",
            questionId: 4,
            english: "Is the property free of dead plants?",
            spanish: "¿La propiedad está libre de plantas muertas?",
            requiresPhoto: true,
            minPhotos: 2,
            onNoPhoto: true,
        },
        {
            key: "q4a",
            questionId: 5,
            english: "If no, did you report dead plants to management?",
            spanish: "¿Se reportaron las plantas muertas a la administración?",
            requiresPhoto: false,
            subQuestion: true,
            dependsOn: "q4",
            showWhen: "no",
        },
        {
            key: "q5",
            questionId: 6,
            english: "Are weeds removed from sidewalk cracks? (weedwacker)",
            spanish: "¿Se removieron las malezas de las grietas en las banquetas?",
            requiresPhoto: false,
        },
        {
            key: "q6",
            questionId: 7,
            english: "Is the turf free of hot spots or dry patches?",
            spanish: "¿El césped está libre de manchas de sequedad o zonas calientes?",
            requiresPhoto: true,
            minPhotos: 1,
            onNoPhoto: true,
        },
        {
            key: "q7",
            questionId: 8,
            english: "Are all plants adequately watered?",
            spanish: "¿Todas las plantas fueron regadas con suficiente agua?",
            requiresPhoto: true,
            onNoPhoto: true,
        },
        {
            key: "q8",
            questionId: 9,
            english: "Newly installed plants, do they have sufficient water? (Check Yes if there are no new plants)",
            spanish: "¿Las plantas recién instaladas tienen suficiente agua? (Marque Sí; si no son nuevas plantas)",
            requiresPhoto: true,
            minPhotos: 2,
        },
        {
            key: "q9",
            questionId: 10,
            english: "Is the irrigation system functioning properly with no broken sprinklers, stuck valves, or damaged mainlines?",
            spanish: "¿El sistema de riego funciona correctamente; no hay aspersores quebrados, las válvulas no se encuentran pegadas, o las líneas se encuentran quebradas?",
            requiresPhoto: true,
            onNoPhoto: true,
        },
        {
            key: "q10",
            questionId: 11,
            english: "Are focal areas mulched?",
            spanish: "¿Las áreas focales tienen mantillo (mulch)?",
            requiresPhoto: true,
            minPhotos: 1,
        },
        {
            key: "q11",
            questionId: 12,
            english: "Is the property free of downed trees or large fallen limbs?",
            spanish: "¿La propiedad está libre de árboles caídos o ramas grandes?",
            requiresPhoto: true,
            onNoPhoto: true,
        },
    ];
    return (
        <>
            <TitleBar
                safetyIcon
                title={
                    isSpanish
                        ? "Lista de Verificación de Control de Calidad del Capataz"
                        : "Foreman QC List"
                }
            />
            <EventPopups
                open={openSnackBar}
                setOpen={setOpenSnackBar}
                color={snackBarColor}
                text={snackBarText}
            />
            <div className="container-fluid">
                {loading ? (
                    <div className="center-loader">
                        <CircularProgress />
                    </div>
                ) : (
                    <div className="card">
                        <div className="itemtitleBar d-flex justify-content-between align-items-center">
                            <h4>
                                {isSpanish
                                    ? "Detalles de Control de Calidad"
                                    : "QC Details"}
                            </h4>
                            <div className="d-flex align-items-center gap-3">
                                <div className="d-flex align-items-center">
                                    <span style={{ marginRight: "8px", color: !isSpanish ? "#7c9c3d" : "#888" }}>
                                        English
                                    </span>
                                    <div className="form-check form-switch" style={{ margin: "0 8px" }}>
                                        <input
                                            className="form-check-input"
                                            type="checkbox"
                                            id="languageToggle"
                                            checked={isSpanish}
                                            onChange={() => setIsSpanish(prev => !prev)}
                                            style={{
                                                width: "40px",
                                                height: "22px",
                                                backgroundColor: isSpanish ? "#7c9c3d" : "#ccc",
                                                borderColor: "#7c9c3d",
                                                cursor: "pointer"
                                            }}
                                        />
                                    </div>
                                    <span style={{ marginLeft: "8px", color: isSpanish ? "#7c9c3d" : "#888" }}>
                                        Español
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="card-body p-0 ">
                            <div className="row mx-2 mt-2">
                                <div className="col-md-2">
                                    <label className="form-label">
                                        {isSpanish ? "Nombre del Cliente:" : "Customer Name:"} <span className="text-danger">*</span>
                                    </label>
                                    <CustomerAutocomplete
                                        // disableField={true}
                                        formData={formData}
                                        setFormData={setFormData}
                                        submitClicked={false}
                                    />
                                </div>
                                <div className="col-md-2">
                                    <label className="form-label">
                                        {isSpanish ? "Capataz:" : "Foreman:"}<span className="text-danger">*</span>
                                    </label>
                                    <Autocomplete
                                    // disabled
                                        id="foreman-autocomplete"
                                        size="small"
                                        options={staffData.filter(
                                            (staff) => staff.Role === "Foreman"
                                        )}
                                        getOptionLabel={(option) =>
                                            option.FirstName + " " + option.LastName || ""
                                        }
                                        value={
                                            staffData.find(
                                                (staff) => staff.UserId === formData.ForemanUserId
                                            ) || null
                                        }
                                        onChange={(event, newValue) =>
                                            handleAutocompleteChange(
                                                "ForemanUserId",
                                                "UserId",
                                                event,
                                                newValue
                                            )
                                        }
                                        isOptionEqualToValue={(option, value) =>
                                            option.UserId === value.ForemanUserId
                                        }
                                        renderOption={(props, option) => (
                                            <li {...props}>
                                                <div className="customer-dd-border">
                                                    <div className="row">
                                                        <div className="col-md-12">
                                                            <h6 className="pb-0 mb-0">
                                                                {option.FirstName} {option.LastName}
                                                            </h6>
                                                        </div>
                                                        <div className="col-md-12">
                                                            <small>
                                                                {"("}
                                                                {option.Role}
                                                                {")"}
                                                            </small>
                                                        </div>
                                                    </div>
                                                </div>
                                            </li>
                                        )}
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                label=""
                                                placeholder={isSpanish ? "Elegir..." : "Choose..."}
                                                className="bg-white"
                                            />
                                        )}
                                    />
                                </div>
                                <div className="col-md-2">
                                    <label className="form-label">
                                        {isSpanish ? "Fecha:" : "Date:"}
                                    </label>
                                    <TextField
                                    // disabled
                                        value={formatDate(formData.ReportDate)}
                                        name="ReportDate"
                                        onChange={handleInputChange}
                                        className="input-limit-datepicker"
                                        type="date"
                                        variant="outlined"
                                        size="small"
                                        fullWidth
                                    />
                                </div>
                                <div className="col-md-2">
                                    <label className="form-label">Status:</label>
                                    <FormControl fullWidth>
                                        <Select
                                            name="ForemanQCChecklistFormStatusId"
                                            value={formData.ForemanQCChecklistFormStatusId || ""}
                                            onChange={handleInputChange}
                                            size="small"
                                        >
                                            {statusList.map((status) => (
                                                <MenuItem
                                                    key={status.ForemanQCChecklistFormStatusId}
                                                    value={status.ForemanQCChecklistFormStatusId}
                                                >
                                                    {status.Status}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </div>
                            </div>
                            <div className="row  mt-4">
                                <div className="col-12">
                                    <div className="itemtitleBar mb-3">
                                        <h4>
                                            {isSpanish
                                                ? "Lista de Verificación de Control de Calidad del Capataz"
                                                : "Quality Control Checklist"}
                                        </h4>
                                    </div>
                                    {qcQuestions.map((question, index) => {
                                        if (
                                            question.subQuestion &&
                                            formData[question.dependsOn] !== question.showWhen
                                        ) {
                                            return null;
                                        }
                                        return (
                                            <div
                                                key={question.key}
                                                className="row align-items-center "
                                                style={{
                                                    borderBottom: "1px solid #f8f9fa",
                                                    borderRadius: "8px",
                                                    paddingLeft: "2%",
                                                    // border: questionsWithErrors.has(question.key) ? "2px solid #dc3545" : "none",
                                                    backgroundColor: questionsWithErrors.has(question.key) ? "#fff5f5" : "transparent",
                                                    margin: questionsWithErrors.has(question.key) ? "4px 0" : "0",
                                                    padding: questionsWithErrors.has(question.key) ? "8px 1%" : "0 1%"
                                                }}
                                            >
                                                <div className="col-md-6">
                                                    <h6 className="fw-normal mb-0">
                                                        {isSpanish ? question.spanish : question.english}
                                                    </h6>
                                                </div>
                                                <div className="col-md-2">
                                                    <RadioOption
                                                        name={question.key}
                                                        formData={formData}
                                                        setFormData={setFormData}
                                                        options={[
                                                            {
                                                                value: "yes",
                                                                label: isSpanish ? "Sí" : "Yes",
                                                            },
                                                            { value: "no", label: "No" },
                                                        ]}
                                                    />
                                                </div>
                                                <div className="col-md-4">
                                                    <div className="d-flex flex-row mb-2">
                                                        {/* BEFORE section */}
                                                        <div className="me-4">
                                                            <div>{isSpanish ? "Antes" : "Before"}</div>
                                                            <div className="d-flex flex-wrap align-items-center mt-2">
                                                                {questionFiles[question.key] && questionFiles[question.key].map(
                                                                    (file, idx) => (
                                                                        <div
                                                                            key={idx}
                                                                            className="me-2 mb-2 d-flex align-items-center"
                                                                            style={{ position: "relative" }}
                                                                        >
                                                                            <img
                                                                                src={file.isExisting ? file.url : URL.createObjectURL(file)}
                                                                                alt={`${question.key}_${idx}`}
                                                                                style={{
                                                                                    width: "40px",
                                                                                    height: "40px",
                                                                                    objectFit: "cover",
                                                                                    borderRadius: "4px",
                                                                                    cursor: "pointer",
                                                                                    border: "2px solid rgb(236, 239, 243)" // Add border here
                                                                                }}
                                                                                onClick={() => openImageModal(
                                                                                    file.isExisting ? file.url : URL.createObjectURL(file),
                                                                                    file.name
                                                                                )}
                                                                            />
                                                                        </div>
                                                                    )
                                                                )}
                                                                {(!questionFiles[question.key] || questionFiles[question.key].length < 3) && (
                                                                    <span
                                                                        style={{ cursor: "pointer", marginLeft: "8px" }}
                                                                        onClick={() =>
                                                                            document
                                                                                .getElementById(`file-${question.key}`)
                                                                                .click()
                                                                        }
                                                                    >
                                                                        {/* Upload button */}
                                                                    </span>
                                                                )}
                                                                <input
                                                                    type="file"
                                                                    id={`file-${question.key}`}
                                                                    style={{ display: "none" }}
                                                                    accept="image/*"
                                                                    multiple
                                                                    // onChange={(e) =>
                                                                    //     handleQuestionFileUpload(e, question.key)
                                                                    // }
                                                                />
                                                            </div>
                                                        </div>
                                                        {/* AFTER section */}
                                                        <div>
                                                            <div>{isSpanish ? "Después" : "After"}</div>
                                                            <div className="d-flex flex-wrap align-items-center mt-2">
                                                                {questionFiles[`${question.key}After`] &&
                                                                    questionFiles[`${question.key}After`].map((file, idx) => (
                                                                        <div key={idx} className="me-2 mb-2 d-flex align-items-center" style={{ position: "relative"}}>
                                                                            <img
                                                                                src={file.isExisting ? file.url : URL.createObjectURL(file)}
                                                                                alt={`${question.key}_after_${idx}`}
                                                                                style={{
                                                                                    width: "40px",
                                                                                    height: "40px",
                                                                                    objectFit: "cover",
                                                                                    borderRadius: "4px",
                                                                                    cursor: "pointer",
                                                                                    border: "2px solid rgb(236, 239, 243)" // Add border here
                                                                                }}
                                                                                onClick={() => openImageModal(
                                                                                    file.isExisting ? file.url : URL.createObjectURL(file),
                                                                                    file.name
                                                                                )}
                                                                            />
                                                                        </div>
                                                                    ))}
                                                                {(!questionFiles[`${question.key}After`] || questionFiles[`${question.key}After`].length < 3) && (
                                                                    <span
                                                                        style={{ cursor: "pointer", marginLeft: "8px" }}
                                                                        onClick={() =>
                                                                            document
                                                                                .getElementById(`file-after-${question.key}`)
                                                                                .click()
                                                                        }
                                                                    >
                                                                        {/* Upload button */}
                                                                    </span>
                                                                )}
                                                                <input
                                                                    type="file"
                                                                    id={`file-after-${question.key}`}
                                                                    style={{ display: "none" }}
                                                                    accept="image/*"
                                                                    multiple
                                                                    // onChange={(e) => {
                                                                    //     handleQuestionFileUpload(
                                                                    //         e,
                                                                    //         `${question.key}After`
                                                                    //     );
                                                                    //     setTimeout(() => {
                                                                    //         setFormData(prev => ({
                                                                    //             ...prev,
                                                                    //             [question.key]: "yes"
                                                                    //         }));
                                                                    //     }, 100);
                                                                    // }}
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}

                                </div>
                            </div>
                            <div className="row  mt-4">
                                <div className="col-12">
                                    <div className="itemtitleBar mb-3">
                                        <h4>
                                            {isSpanish
                                                ? "Rotación"
                                                : "Rotations"}
                                        </h4>

                                    </div>
                                    <div className="row mt-4 mx-2">
                                        <div className="col-md-4">
                                            <label className="form-label">
                                                {isSpanish
                                                    ? "¿En qué área de la rotación está trabajando esta semana?"
                                                    : "What rotation are you working in this week?"}
                                            </label>
                                            <textarea 
                                            // disabled
                                                className="form-control form-control-sm"
                                                name="q12"
                                                value={formData.q12}
                                                onChange={handleInputChange}
                                                rows={3}
                                                placeholder={
                                                    isSpanish
                                                        ? "Ingrese la rotación actual"
                                                        : "Enter current rotation"
                                                }
                                            />
                                        </div>
                                        <div className="col-md-4">
                                            <label className="form-label">
                                                {isSpanish
                                                    ? "¿Cuál es el área de rotación de la próxima semana?"
                                                    : "What is next week's rotation?"}
                                            </label>
                                            <textarea
                                            // disabled
                                                className="form-control form-control-sm"
                                                name="q13"
                                                value={formData.q13}
                                                onChange={handleInputChange}
                                                rows={3}
                                                placeholder={
                                                    isSpanish
                                                        ? "Ingrese la próxima rotación"
                                                        : "Enter next week's rotation"
                                                }
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="d-flex justify-content-between" style={{ padding: "24px 24px 24px 24px" }}>
                                <div>
                                    <BackButton
                                        onClick={() => {
                                            navigate(`/qc-list`);
                                        }}
                                    >
                                        {isSpanish ? "Atrás" : "Back"}
                                    </BackButton>
                                </div>
                                <div>
                                    <LoaderButton
                                        loading={disableButton}
                                        handleSubmit={handleSubmit}
                                        disable={disableButton}
                                    >
                                        Save
                                    </LoaderButton>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Image Modal */}
            <Modal
                open={imageModalOpen}
                onClose={closeImageModal}
                aria-labelledby="image-modal"
                aria-describedby="full-size-image-view"
            >
                <Box
                    sx={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        maxWidth: '90vw',
                        maxHeight: '90vh',
                        bgcolor: 'background.paper',
                        boxShadow: 24,
                        p: 2,
                        borderRadius: 2,
                        outline: 'none',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center'
                    }}
                >
                    <Box
                        sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            width: '100%',
                            mb: 2
                        }}
                    >
                        <h6 style={{ margin: 0, color: '#333' }}>
                            { 'Image Preview'}
                        </h6>
                        <IconButton
                            onClick={closeImageModal}
                            sx={{
                                color: '#666',
                                '&:hover': {
                                    backgroundColor: '#f5f5f5'
                                }
                            }}
                        >
                            <Close />
                        </IconButton>
                    </Box>
                    {selectedImage && (
                        <img
                            src={selectedImage.url}
                            alt={selectedImage.name}
                            style={{
                                maxWidth: '100%',
                                maxHeight: '70vh',
                                objectFit: 'contain',
                                borderRadius: '8px',
                                boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
                            }}
                        />
                    )}
                </Box>
            </Modal>
        </>
    );
};
