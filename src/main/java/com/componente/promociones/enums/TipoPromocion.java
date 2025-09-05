package com.componente.promociones.enums;

public enum TipoPromocion {
    /** Descuento basado en un porcentaje del total (ej: 25% de descuento) */
    DESCUENTO_PORCENTAJE("Descuento por Porcentaje"),

    /** Descuento de un monto fijo (ej: $10 de descuento) */
    DESCUENTO_MONTO_FIJO("Descuento Monto Fijo"),

    /** Promoción donde se paga 1 y se lleva 2 productos */
    DOS_POR_UNO("2x1"),

    /** Promoción donde se paga 2 y se lleva 3 productos */
    TRES_POR_DOS("3x2"),

    /** Envío gratuito en la compra */
    ENVIO_GRATIS("Envio Gratis"),

    /** Regalo de un producto específico */
    REGALO_PRODUCTO("Regalo de Producto"),

    /** Devolución de dinero posterior a la compra */
    CASHBACK("CashBack");

    private final String descripcion;


    /**Constructor para inicializar la descripcion del tipo de promocion */
    TipoPromocion(String descripcion) {
        this.descripcion = descripcion;
    }

    public String getDescripcion()
    {
        return descripcion;
    }
}
