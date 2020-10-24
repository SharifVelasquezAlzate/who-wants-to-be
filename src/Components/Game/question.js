const curtainUp = async () => {
    const telon = document.getElementsByClassName('telon').item(0);
    telon.style.opacity = 1;
    telon.style.zIndex = 1;
    await telon.classList.remove('mostrarHaciaAbajo');
    telon.classList.add('mostrarHaciaArriba');
}

const curtainDown = async () => {
    const telon = document.getElementsByClassName('telon').item(0);
    telon.style.opacity = 0;
    telon.style.zIndex = -1;
    await telon.classList.remove('mostrarHaciaArriba');
    await telon.classList.add('mostrarHaciaAbajo');
}

module.exports = { curtainUp, curtainDown };