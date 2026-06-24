export const setPrimaryColor = (color,primaryHover) => {
    document.documentElement.style.setProperty('--primary', color);
    document.documentElement.style.setProperty('--primary-hover', primaryHover);
};