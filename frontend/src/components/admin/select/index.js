import Select from "react-select";
import { memo, useEffect, useState } from "react";
import { TourApi } from "services";

const TourSelector = ({ formData, setFormData, setDataDate }) => {
    const [tours, setTours] = useState([{
        id: null,
        code: null,
        name: null,
        quantityDay: null
    }]);

    useEffect(() => {
        const fetchTours = async () => {
            try {
                const response = await TourApi.getList();

                if (response?.code === 1513) {
                    setTours(response?.result);
                }
            } catch (error) {
                console.error("Failed to fetch tours: ", error);
            }
        }

        fetchTours();
    }, [])

    const options = tours.map((tour) => ({
        value: tour.id,
        label: `${tour.code} - ${tour.name}`,
        quantityDay: tour.quantityDay,
    }));

    const customFilter = (option, inputValue) => {
        const label = option.label.toLowerCase();
        return label.includes(inputValue.toLowerCase());
    };

    const handleSelectChange = (selectedOption) => {
        if (selectedOption) {
            setFormData({
                ...formData,
                tourId: selectedOption.value,
            });

            setDataDate((prev) => ({
                ...prev,
                quantityDay: selectedOption.quantityDay,
            }));
        } else {
            setFormData({
                ...formData,
                tourId: "",
            });

            setDataDate((prev) => ({
                ...prev,
                quantityDay: "",
            }));
        }
    };

    return (
        <div className="mb-3">
            <label className="form-label">Tours:</label>
            <Select
                options={options}
                onChange={handleSelectChange}
                value={options.find((opt) => opt.value === formData.tourId) || null}
                placeholder="--Chọn một tour--"
                isClearable
                isSearchable
                filterOption={customFilter}
                required
            />
        </div>
    );
};

export default memo(TourSelector);