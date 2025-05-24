document.addEventListener("DOMContentLoaded", function () {
    const btnRegister = document.getElementById("btn_register");
    const apiBaseUrl = $('meta[name="api-base-url"]').attr('content');

    btnRegister.addEventListener("click", function (e) {
        e.preventDefault(); // Evitar envío de formulario

        // Obtener valores de los campos
        const nombre = document.getElementById("registerNombre").value;
        const nombreUsuario = document.getElementById("registerNombreUsuario").value;
        const email = document.getElementById("registerEmail").value;
        const password = document.getElementById("registerPassword").value;
        const confirmPassword = document.getElementById("confirmPassword").value;

        // Mostrar en consola
        console.log("Enviando datos al proxy...");
        console.log({ nombre, nombreUsuario, email, password, confirmPassword });

        // Enviar al proxy por POST
        fetch(`${apiBaseUrl}/api/Usuarios/registro`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                nombre: nombre,
                usuario: nombreUsuario,
                email: email,
                contrasena: password,
                repetirContrasena: confirmPassword
            })
        })
            .then(response => response.json())
            .then(data => {
                console.log("Respuesta del proxy:", data);
                alert(data.mensaje || "Registro procesado");
            })
            .catch(error => {
                console.error("Error al contactar el proxy:", error);
                alert("Hubo un error al registrar.");
            });
    });

    const btnLogin = document.getElementById("btn_login");

    btnLogin.addEventListener("click", function (e) {
        e.preventDefault();

        const email = document.getElementById("loginEmail").value;
        const password = document.getElementById("loginPassword").value;

        fetch("/Cuenta/Login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                usuario: email,
                contrasena: password
            })
        })
            .then(response => {
                if (response.ok) {
                    window.location.reload(); // Recarga para que aparezca como logueado
                } else {
                    return response.json().then(data => {
                        alert(data.mensaje || "Login incorrecto");
                    });
                }
            })
            .catch(error => {
                console.error("Error al iniciar sesión:", error);
                alert("Hubo un error al iniciar sesión.");
            });
    });

});