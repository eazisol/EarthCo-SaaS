const toggleSideBar = () => {
    // $('.navLabel').addClass('dispNone');
    // $('#sideBarDez').addClass('toShort');
    // $('#contentBody').addClass('bodyChanges');
    // $('.header-left').addClass('bodyChanges');
    // $('.nav-header').addClass('toShort')
    console.log('short screen');
}

if (window.screen.width <= 1024) {
    toggleSideBar();
}