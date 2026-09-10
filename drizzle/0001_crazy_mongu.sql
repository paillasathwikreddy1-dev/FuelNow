CREATE TABLE `scamReports` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`message` text NOT NULL,
	`url` varchar(1000),
	`category` varchar(160) NOT NULL,
	`region` varchar(120),
	`notes` text,
	`status` enum('pending','verified','rejected') NOT NULL DEFAULT 'pending',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `scamReports_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `scans` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`mode` enum('message','url','screenshot') NOT NULL,
	`sourceText` text,
	`riskScore` int NOT NULL,
	`category` varchar(160) NOT NULL,
	`language` varchar(80),
	`resultJson` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `scans_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `simulatorScores` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`correct` int NOT NULL DEFAULT 0,
	`attempted` int NOT NULL DEFAULT 0,
	`bestScore` int NOT NULL DEFAULT 0,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `simulatorScores_id` PRIMARY KEY(`id`)
);
