SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS `movcom_usuarios`;
DROP TABLE IF EXISTS `movcom_dominios`;
DROP TABLE IF EXISTS `movcom_sitios_favoritos`;
DROP TABLE IF EXISTS `movcom_entidades`;
DROP TABLE IF EXISTS `movcom_secretarias`;
DROP TABLE IF EXISTS `movcom_vehiculos`;
DROP TABLE IF EXISTS `movcom_rutas`;
DROP TABLE IF EXISTS `movcom_puntos_rutas`;
DROP TABLE IF EXISTS `movcom_registros`;
DROP TABLE IF EXISTS `movcom_trayectos`;
DROP TABLE IF EXISTS `movcom_suscripcion_ruta`;
SET FOREIGN_KEY_CHECKS = 1;

CREATE TABLE `movcom_usuarios` (
    `usuario_id` INTEGER NOT NULL,
    `usuario_cedula` INTEGER,
    `usuario_estado` BOOLEAN NOT NULL,
    `usuario_nombre` VARCHAR(120),
    `usuario_celular` VARCHAR(13),
    `usuario_correo` VARCHAR(40) NOT NULL,
    `usuario_foto` BLOB,
    `entidad_id` INTEGER NOT NULL,
    PRIMARY KEY (`usuario_id`),
    UNIQUE (`usuario_id`)
);

CREATE TABLE `movcom_dominios` (
    `dominio_id` INTEGER NOT NULL,
    `dominio_estado` BOOLEAN NOT NULL,
    `dominio_nombre` VARCHAR(70) NOT NULL,
    PRIMARY KEY (`dominio_id`),
    UNIQUE (`dominio_id`)
);

CREATE TABLE `movcom_sitios_favoritos` (
    `sitio_id` INTEGER NOT NULL,
    `stio_nombre` VARCHAR(30) NOT NULL,
    `sitio_descripcion` VARCHAR(30),
    `sitio_latitud` VARCHAR(255) NOT NULL,
    `sitio_longitud` VARCHAR(255) NOT NULL,
    `sitio_direccion` VARCHAR(80) NOT NULL,
    `usuario_id` INTEGER NOT NULL,
    PRIMARY KEY (`sitio_id`),
    UNIQUE (`sitio_id`)
);

CREATE TABLE `movcom_entidades` (
    `entidad_id` INTEGER NOT NULL,
    `entidad_nombre` VARCHAR(200) NOT NULL,
    `entidad_descripcion` VARCHAR(255),
    `secretaria_id` INTEGER NOT NULL,
    PRIMARY KEY (`entidad_id`),
    UNIQUE (`entidad_id`)
);

CREATE TABLE `movcom_secretarias` (
    `secretaria_id` INTEGER NOT NULL,
    `secretaria_nombre` VARCHAR(200) NOT NULL,
    `secretaria_descripcion` VARCHAR(255),
    PRIMARY KEY (`secretaria_id`),
    UNIQUE (`secretaria_id`)
);

CREATE TABLE `movcom_vehiculos` (
    `vehiculo_id` INTEGER NOT NULL,
    `vehiculo_placa` VARCHAR(6) NOT NULL,
    `vehiculo_marca` VARCHAR(20) NOT NULL,
    `vehiculo_modelo` INTEGER NOT NULL,
    `vehiculo_color` VARCHAR(20) NOT NULL,
    `vehiculo_foto` BLOB NOT NULL,
    `vehiculo_cupo` INTEGER NOT NULL,
    `usuario_id` INTEGER NOT NULL,
    PRIMARY KEY (`vehiculo_id`),
    UNIQUE (`vehiculo_id`)
);

CREATE TABLE `movcom_rutas` (
    `ruta_id` INTEGER NOT NULL,
    `ruta_inicio_direccion` VARCHAR(255) NOT NULL,
    `ruta_inicio_latitud` VARCHAR(255) NOT NULL,
    `ruta_inicio_longitud` VARCHAR(255) NOT NULL,
    `ruta_destino_direccion` VARCHAR(255) NOT NULL,
    `ruta_destino_latitud` VARCHAR(255) NOT NULL,
    `ruta_destino_longitud` VARCHAR(255) NOT NULL,
    `ruta_nombre` VARCHAR(60) NOT NULL,
    `ruta_hora_inicio` TIME NOT NULL,
    `ruta_lunes` BOOLEAN NOT NULL,
    `ruta_martes` BOOLEAN NOT NULL,
    `ruta_miercoles` BOOLEAN NOT NULL,
    `ruta_jueves` BOOLEAN NOT NULL,
    `ruta_viernes` BOOLEAN NOT NULL,
    `ruta_sabado` BOOLEAN NOT NULL,
    `ruta_domingo` BOOLEAN NOT NULL,
    PRIMARY KEY (`ruta_id`),
    UNIQUE (`ruta_id`)
);

CREATE TABLE `movcom_puntos_rutas` (
    `punto_id` INTEGER NOT NULL,
    `punto_latitud` VARCHAR(255) NOT NULL,
    `punto_longitud` VARCHAR(255) NOT NULL,
    `punto_descripcion` VARCHAR(80) NOT NULL,
    `ruta_id` INTEGER NOT NULL,
    PRIMARY KEY (`punto_id`),
    UNIQUE (`punto_id`)
);

CREATE TABLE `movcom_registros` (
    `registro_id` INTEGER NOT NULL,
    `registro_fecha` DATE NOT NULL,
    `registro_hora` TIME NOT NULL,
    `registro_estado` BOOLEAN NOT NULL,
    `ruta_id` INTEGER NOT NULL,
    PRIMARY KEY (`registro_id`),
    UNIQUE (`registro_id`)
);

CREATE TABLE `movcom_trayectos` (
    `trayecto_id` INTEGER NOT NULL,
    `trayecto_inicio_fecha` DATE NOT NULL,
    `trayecto_inicio_hora` TIME NOT NULL,
    `trayecto_inicio_direccion` VARCHAR(255) NOT NULL,
    `trayecto_inicio_latitud` VARCHAR(255) NOT NULL,
    `trayecto_inicio_longitud` VARCHAR(255) NOT NULL,
    `trayecto_destino_fecha` DATE NOT NULL,
    `trayecto_destino_hora` TIME NOT NULL,
    `trayecto_destino_direccion` VARCHAR(255) NOT NULL,
    `trayecto_destino_latitud` VARCHAR(255) NOT NULL,
    `trayecto_destino_longitud` VARCHAR(255) NOT NULL,
    `ruta_id` INTEGER NOT NULL,
    PRIMARY KEY (`trayecto_id`),
    UNIQUE (`trayecto_id`)
);

CREATE TABLE `movcom_suscripcion_ruta` (
    `suscripcion_id` INTEGER NOT NULL,
    `usuario_id` INTEGER NOT NULL,
    `ruta_id` INTEGER NOT NULL,
    PRIMARY KEY (`suscripcion_id`),
    UNIQUE (`suscripcion_id`)
);

ALTER TABLE `movcom_secretarias` CHANGE COLUMN `secretaria_id` `secretaria_id` INT(11) NOT NULL AUTO_INCREMENT ;
ALTER TABLE `movcom_usuarios` CHANGE COLUMN `usuario_id` `usuario_id` INT(11) NOT NULL AUTO_INCREMENT ;
ALTER TABLE `movcom_dominios` CHANGE COLUMN `dominio_id` `dominio_id` INT(11) NOT NULL AUTO_INCREMENT ;
ALTER TABLE `movcom_sitios_favoritos` CHANGE COLUMN `sitio_id` `sitio_id` INT(11) NOT NULL AUTO_INCREMENT ;
ALTER TABLE `movcom_entidades` CHANGE COLUMN `entidad_id` `entidad_id` INT(11) NOT NULL AUTO_INCREMENT ;
ALTER TABLE `movcom_rutas` CHANGE COLUMN `ruta_id` `ruta_id` INT(11) NOT NULL AUTO_INCREMENT ;
ALTER TABLE `movcom_puntos_rutas` CHANGE COLUMN `punto_id` `punto_id` INT(11) NOT NULL AUTO_INCREMENT ;
ALTER TABLE `movcom_registros` CHANGE COLUMN `registro_id` `registro_id` INT(11) NOT NULL AUTO_INCREMENT ;
ALTER TABLE `movcom_trayectos` CHANGE COLUMN `trayecto_id` `trayecto_id` INT(11) NOT NULL AUTO_INCREMENT ;
ALTER TABLE `movcom_suscripcion_ruta` CHANGE COLUMN `suscripcion_id` `suscripcion_id` INT(11) NOT NULL AUTO_INCREMENT ;
ALTER TABLE `movcom_vehiculos` CHANGE COLUMN `vehiculo_id` `vehiculo_id` INT(11) NOT NULL AUTO_INCREMENT ;

ALTER TABLE `movcom_usuarios` ADD FOREIGN KEY (`entidad_id`) REFERENCES `movcom_entidades`(`entidad_id`);
ALTER TABLE `movcom_sitios_favoritos` ADD FOREIGN KEY (`usuario_id`) REFERENCES `movcom_usuarios`(`usuario_id`);
ALTER TABLE `movcom_entidades` ADD FOREIGN KEY (`secretaria_id`) REFERENCES `movcom_secretarias`(`secretaria_id`);
ALTER TABLE `movcom_vehiculos` ADD FOREIGN KEY (`usuario_id`) REFERENCES `movcom_usuarios`(`usuario_id`);
ALTER TABLE `movcom_puntos_rutas` ADD FOREIGN KEY (`ruta_id`) REFERENCES `movcom_rutas`(`ruta_id`);
ALTER TABLE `movcom_registros` ADD FOREIGN KEY (`ruta_id`) REFERENCES `movcom_rutas`(`ruta_id`);
ALTER TABLE `movcom_trayectos` ADD FOREIGN KEY (`ruta_id`) REFERENCES `movcom_rutas`(`ruta_id`);
ALTER TABLE `movcom_suscripcion_ruta` ADD FOREIGN KEY (`usuario_id`) REFERENCES `movcom_usuarios`(`usuario_id`);
ALTER TABLE `movcom_suscripcion_ruta` ADD FOREIGN KEY (`ruta_id`) REFERENCES `movcom_rutas`(`ruta_id`);