CREATE SCHEMA IF NOT EXISTS `opendata` DEFAULT CHARACTER SET utf8 ;
USE `opendata` ;

-- -----------------------------------------------------
-- Table `mydb`.`routes`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `opendata`.`routes` (
  `route_id` INT NOT NULL,
  `agency_id` INT NOT NULL,
  `route_short_name` CHAR(3) NOT NULL,
  `route_long_name` VARCHAR(45) NOT NULL,
  `route_type` INT,
  `route_color` VARCHAR(45),
  `route_text_color` VARCHAR(45),
  PRIMARY KEY (`route_id`)
)
ENGINE = InnoDB;

-- -----------------------------------------------------
-- Table `mydb`.`calendar`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `opendata`.`calendar` (
  `service_id` VARCHAR(45) NOT NULL,
  `monday` INT NOT NULL,
  `tuesday` INT NOT NULL,
  `wednesday` INT NOT NULL,
  `thursday` INT NOT NULL,
  `friday` INT NOT NULL,
  `saturday` INT NOT NULL,
  `sunday` INT NOT NULL,
  `start_date` DATE NOT NULL,
  `end_date` DATE NOT NULL,
  PRIMARY KEY (`service_id`,`start_date`,`end_date`)
)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `mydb`.`calendar_dates`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `opendata`.`calendar_dates` (
  `service_id` VARCHAR(45) NOT NULL,
  `date` DATE NOT NULL,
  `exception_type` INTEGER(1) NOT NULL,
  PRIMARY KEY (`service_id`,`date`),
  FOREIGN KEY (`service_id`) REFERENCES calendar (`service_id`)
  )
ENGINE = InnoDB;

-- -----------------------------------------------------
-- Table `mydb`.`stops`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `opendata`.`stops` (
  `stop_id` INT NOT NULL,
  `stop_code` VARCHAR(45) NOT NULL,
  `stop_name` VARCHAR(45) NOT NULL,
  `stop_desc` VARCHAR(45),
  `stop_lat` FLOAT(10,7) NOT NULL,
  `stop_lon` FLOAT(10,7) NOT NULL,
  `zone_id` VARCHAR(45) NOT NULL,
  `wheelchair_boarding` VARCHAR(45),
  PRIMARY KEY (`stop_id`))
ENGINE = InnoDB;

-- -----------------------------------------------------
-- Table `mydb`.`trips`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `opendata`.`trips` (
  `route_id` INT NOT NULL,
  `service_id` VARCHAR(45) NOT NULL,
  `trip_id` VARCHAR(45) NOT NULL,
  `trip_headsign` VARCHAR(45) NULL,
  `direction_id` INT NOT NULL,
  `shape_id` VARCHAR(100),
  `wheelchair_accesible` VARCHAR(45),
  PRIMARY KEY (`trip_id`),
  FOREIGN KEY (`service_id`) REFERENCES calendar (`service_id`)
)
ENGINE = InnoDB;

-- -----------------------------------------------------
-- Table `mydb`.`stop_times`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `opendata`.`stop_times` (
  `trip_id` VARCHAR(45) NOT NULL,
  `arrival_time` TIME NOT NULL,
  `departure_time` TIME NOT NULL,
  `stop_id` INT NOT NULL,
  `stop_sequence` INT NOT NULL,
  PRIMARY KEY (`trip_id`, `stop_id`, `stop_sequence`),
  FOREIGN KEY (`trip_id`) REFERENCES trips(`trip_id`),
  FOREIGN KEY (`stop_id`) REFERENCES stops(`stop_id`)
)
ENGINE = InnoDB;