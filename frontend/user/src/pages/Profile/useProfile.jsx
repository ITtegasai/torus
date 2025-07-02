import { useContext, useEffect, useState } from "react";
import { WSContext } from "../../context/WebSocketContext";
import { updateImage, updateUserData } from "../../api/main";
import { useCookies } from "react-cookie";
import { toast } from "react-toastify";
import useOpenPage from "../../hooks/useOpenPage";

export const useProfile = () => {
  const [visible, setVisible] = useState(true);
  const [image, setImage] = useState(null);
  const [isLoading, setLoading] = useState(false);
  const [changedFields, setChangedFields] = useState({});
  const [initialValues, setInitialValues] = useState({});
  const { user } = useContext(WSContext);
  const [cookies] = useCookies(["access_token"]);
  const token = cookies?.access_token;
  const [isPhotoChanged, setPhotoChanged] = useState(false);

  const [formData, setFormData] = useState({
    first_name: "",
    phone: "",
    birthday: "",
    city: "",
    profession: "",
    telegram: "",
    education: "",
    registration: "",
    passport_number: "",
    passport_date: "",
    username: "",
    email: "",
  });

  const userPhoto = user
    ? `${import.meta.env.VITE_MAIN_URL}/images/${user.uid}.jpg`
    : null;

  useOpenPage('User')

  useEffect(() => {
    if (user) {
      const loadedValues = {
        first_name: user.first_name || "",
        phone: user.phone || "",
        birthday: user.birthday || "",
        city: user.city || "",
        profession: user.profession || "",
        telegram: user.telegram || "",
        passport_date: user.passport_date || "",
        passport_number: user.passport_number || "",
        registration: user.registration || "",
        education: user.education || "",
        username: user.username || "",
        email: user.email || "",
      };
      setInitialValues(loadedValues); // Устанавливаем начальные значения
      setFormData(loadedValues);
    }
  }, [user]);

  const hasChanged = Object.keys(changedFields).length > 0 || isPhotoChanged;

  const onSave = async () => {
    try {
      setLoading(true);
      if (isPhotoChanged) {
        const formData = new FormData();
        formData.append("image", image);
        await updateImage(token, formData);
      }

      if (hasChanged) {
        await updateUserData(token, "user_data", changedFields);
      }

      setChangedFields({});
      setPhotoChanged(false);
      toast.success('Данные успешно сохранены')
    } catch (e) {
      console.log(e);
      toast.error("Ошибка, проверьте Интернет соединение и попробуйте еще раз");
    } finally {
      setLoading(false);
    }
  };

  const changePhoto = (photo) => {
    setImage(photo);
    setPhotoChanged(image !== photo);
  };

  useEffect(() => {

  }, []) 

  const changeField = (val, fieldName) => {
    setFormData((prev) => {
      const isChanged = val !== initialValues[fieldName]; // Сравниваем с начальным значением
      setChangedFields((previous) => {
        if (isChanged) {
          return { ...previous, [fieldName]: val };
        } else {
          const { [fieldName]: removed, ...newObj } = previous;
          return newObj;
        }
      });
      return { ...prev, [fieldName]: val };
    });
  };

  return {
    visible,
    setVisible,
    image,
    isLoading,
    hasChanged,
    formData,
    onSave,
    changePhoto,
    changeField,
    userPhoto,
    user
  };
};
