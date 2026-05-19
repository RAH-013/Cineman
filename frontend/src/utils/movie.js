export const formatGenres = (genresString) => {
    if (!genresString) return '';
    const firstGenre = genresString.split(',')[0].trim();
    return firstGenre.charAt(0).toUpperCase() + firstGenre.slice(1);
};

export const getYear = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).getFullYear();
};