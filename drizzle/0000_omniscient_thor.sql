CREATE TABLE `assessments` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`client_email` text NOT NULL,
	`weight` real NOT NULL,
	`height` real NOT NULL,
	`waist` real NOT NULL,
	`neck` real NOT NULL,
	`hip` real NOT NULL,
	`body_fat` real NOT NULL,
	`notes` text DEFAULT '' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `clients` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`email` text NOT NULL,
	`name` text NOT NULL,
	`phone` text DEFAULT '' NOT NULL,
	`goal` text DEFAULT 'Evolução física' NOT NULL,
	`status` text DEFAULT 'ATIVO' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `clients_email_unique` ON `clients` (`email`);--> statement-breakpoint
CREATE TABLE `orders` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`client_email` text NOT NULL,
	`total` real NOT NULL,
	`status` text DEFAULT 'PAGAMENTO PENDENTE' NOT NULL,
	`payment` text DEFAULT 'PIX' NOT NULL,
	`items_json` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `plans` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`client_email` text NOT NULL,
	`type` text NOT NULL,
	`title` text NOT NULL,
	`content_json` text NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `products` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`brand` text DEFAULT 'B7 NUTRITION' NOT NULL,
	`category` text NOT NULL,
	`description` text DEFAULT '' NOT NULL,
	`size` text DEFAULT '' NOT NULL,
	`price` real NOT NULL,
	`old_price` real NOT NULL,
	`stock` integer DEFAULT 0 NOT NULL,
	`badge` text DEFAULT '' NOT NULL,
	`image_url` text DEFAULT '' NOT NULL,
	`active` integer DEFAULT true NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
