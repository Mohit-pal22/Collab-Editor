import API from '../api'

export const fetchDocument = async(id) => {
    try {
        return await API.get(`/documents/${id}`);
    } catch (error) {
        return error;
    }
}