-- Rename projects table to features
ALTER TABLE `projects` RENAME TO `features`;

-- Update foreign key reference in plans table
-- SQLite doesn't support ALTER TABLE to drop/add foreign keys directly
-- So we need to recreate the plans table
CREATE TABLE `__new_plans` (
	`id` text PRIMARY KEY NOT NULL,
	`feature_id` text NOT NULL,
	`title` text NOT NULL,
	`markdown` text NOT NULL,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	FOREIGN KEY (`feature_id`) REFERENCES `features`(`id`) ON UPDATE no action ON DELETE cascade
);

-- Copy data from old plans to new plans (renaming project_id to feature_id)
INSERT INTO `__new_plans` (`id`, `feature_id`, `title`, `markdown`, `created_at`)
SELECT `id`, `project_id`, `title`, `markdown`, `created_at` FROM `plans`;

-- Drop old plans table
DROP TABLE `plans`;

-- Rename new plans table to plans
ALTER TABLE `__new_plans` RENAME TO `plans`;
