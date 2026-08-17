ALTER TABLE `assessments` ADD `age` integer DEFAULT 30 NOT NULL;--> statement-breakpoint
ALTER TABLE `assessments` ADD `sex` text DEFAULT 'male' NOT NULL;--> statement-breakpoint
ALTER TABLE `assessments` ADD `activity` real DEFAULT 1.55 NOT NULL;--> statement-breakpoint
ALTER TABLE `assessments` ADD `measurements_json` text DEFAULT '{}' NOT NULL;
