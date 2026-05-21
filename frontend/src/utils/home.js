export const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toUpperCase();
};

export const getYear = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).getFullYear();
};

export const formatGenres = (genresString) => {
    if (!genresString) return '';
    return genresString.split(',').map(g => g.trim().charAt(0).toUpperCase() + g.trim().slice(1)).join(', ');
};

export const getYouTubeId = (url) => {
    if (!url) return '';
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : url;
};

export const parallaxStyles = `
@keyframes parallax-y {
    0% { transform: scale(1.15) translateY(6%); }
    100% { transform: scale(1.15) translateY(-6%); }
}
.parallax-poster {
    animation: parallax-y 20s linear infinite alternate;
}
`;