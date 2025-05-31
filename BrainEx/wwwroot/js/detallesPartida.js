
if ($("body").hasClass("vista-perfil") {
    string idDelete = $("a.btn-secondary.delete").closest("tr.info-partida").attr("data-item");
    $("a.btn-secondary.delete").closest("tr.info-partida").remove();

    // Llamar petición ajax a proxy para eliminar id.
}

