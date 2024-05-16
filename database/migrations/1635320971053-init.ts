import {MigrationInterface, QueryRunner} from "typeorm";

export class init1635320971053 implements MigrationInterface {
    name = 'init1635320971053'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`nf_token\` (\`status\` tinyint NOT NULL DEFAULT 1, \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at\` timestamp NULL, \`id\` bigint NOT NULL AUTO_INCREMENT, \`address\` varchar(255) NOT NULL, \`index\` int NOT NULL, \`token_uri\` varchar(255) NULL, \`image_or_animation_uri\` varchar(255) NULL, \`protocol_id\` bigint NOT NULL, INDEX \`idx_nfToken_1\` (\`protocol_id\`, \`address\`, \`index\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`lending\` (\`status\` tinyint NOT NULL DEFAULT 1, \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at\` timestamp NULL, \`id\` bigint NOT NULL AUTO_INCREMENT, \`address\` varchar(255) NULL, \`pid\` int NULL, \`liquidity_amount\` decimal(65,22) NOT NULL DEFAULT '0.0000000000000000000000', \`liquidity_value\` decimal(65,22) NOT NULL DEFAULT '0.0000000000000000000000', \`supply_amount\` decimal(65,22) NOT NULL DEFAULT '0.0000000000000000000000', \`supply_value\` decimal(65,22) NOT NULL DEFAULT '0.0000000000000000000000', \`supply_apr\` varchar(255) NULL, \`borrow_amount\` decimal(65,22) NOT NULL DEFAULT '0.0000000000000000000000', \`borrow_value\` decimal(65,22) NOT NULL DEFAULT '0.0000000000000000000000', \`borrow_apr\` varchar(255) NULL, \`reserve_amount\` decimal(65,22) NOT NULL DEFAULT '0.0000000000000000000000', \`reserve_value\` decimal(65,22) NOT NULL DEFAULT '0.0000000000000000000000', \`data\` varchar(255) NULL, \`collateral_factor\` varchar(255) NULL, \`reserve_factor\` varchar(255) NULL, \`link\` varchar(255) NULL, \`protocol_id\` bigint NOT NULL, \`token_id\` bigint NOT NULL, UNIQUE INDEX \`idx_lending_3\` (\`protocol_id\`, \`address\`, \`pid\`), INDEX \`idx_lending_2\` (\`protocol_id\`, \`pid\`), INDEX \`idx_lending_1\` (\`protocol_id\`, \`address\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`protocol\` (\`status\` tinyint NOT NULL DEFAULT 1, \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at\` timestamp NULL, \`id\` bigint NOT NULL AUTO_INCREMENT, \`name\` varchar(255) NOT NULL, \`use_amm\` tinyint NOT NULL DEFAULT 0, \`use_farm\` tinyint NOT NULL DEFAULT 0, \`use_nft\` tinyint NOT NULL DEFAULT 0, \`use_lending\` tinyint NOT NULL DEFAULT 0, \`link\` varchar(255) NULL, \`logo_link\` varchar(255) NULL, \`network_id\` bigint NOT NULL, \`token_id\` bigint NULL, UNIQUE INDEX \`REL_a46cc48987a816645ec5e2b42c\` (\`token_id\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`farm\` (\`status\` tinyint NOT NULL DEFAULT 1, \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at\` timestamp NULL, \`id\` bigint NOT NULL AUTO_INCREMENT, \`name\` varchar(255) NOT NULL, \`address\` varchar(255) NULL, \`pid\` int NULL, \`assets\` varchar(255) NOT NULL, \`liquidity_amount\` decimal(65,22) NOT NULL DEFAULT '0.0000000000000000000000', \`liquidity_value\` decimal(65,22) NOT NULL DEFAULT '0.0000000000000000000000', \`apy\` varchar(255) NULL, \`apr\` varchar(255) NULL, \`data\` varchar(255) NULL, \`link\` varchar(255) NULL, \`protocol_id\` bigint NOT NULL, UNIQUE INDEX \`idx_farm_3\` (\`protocol_id\`, \`address\`, \`pid\`), INDEX \`idx_farm_2\` (\`protocol_id\`, \`pid\`), INDEX \`idx_farm_1\` (\`protocol_id\`, \`address\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`token\` (\`status\` tinyint NOT NULL DEFAULT 1, \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at\` timestamp NULL, \`id\` bigint NOT NULL AUTO_INCREMENT, \`type\` enum ('NATIVE', 'SINGLE', 'MULTI') NOT NULL, \`name\` varchar(255) NOT NULL, \`symbol\` varchar(255) NOT NULL, \`address\` varchar(255) NOT NULL, \`decimals\` int NOT NULL, \`total_supply\` decimal(65,22) NOT NULL DEFAULT '0.0000000000000000000000', \`price_address\` varchar(255) NULL, \`price_value\` decimal(65,22) NOT NULL DEFAULT '0.0000000000000000000000', \`icon_link\` varchar(255) NULL, \`swap_base\` tinyint NOT NULL DEFAULT 0, \`network_id\` bigint NOT NULL, \`pair0_id\` bigint NULL, \`pair1_id\` bigint NULL, \`wrapped_id\` bigint NULL, UNIQUE INDEX \`idx_token_1\` (\`network_id\`, \`address\`), UNIQUE INDEX \`REL_d320e3ab211b71e5caae7cd61e\` (\`wrapped_id\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`interaction\` (\`status\` tinyint NOT NULL DEFAULT 1, \`id\` bigint NOT NULL AUTO_INCREMENT, \`from_address\` varchar(255) NULL, \`to_address\` varchar(255) NULL, \`network_id\` bigint NOT NULL, INDEX \`idx_interaction_2\` (\`network_id\`, \`from_address\`), INDEX \`idx_interaction_1\` (\`from_address\`), UNIQUE INDEX \`IDX_50f3f151e3b67e25cbd951aa27\` (\`network_id\`, \`from_address\`, \`to_address\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`network\` (\`status\` tinyint NOT NULL DEFAULT 1, \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at\` timestamp NULL, \`id\` bigint NOT NULL AUTO_INCREMENT, \`name\` varchar(255) NOT NULL, \`sub_name\` varchar(255) NOT NULL, \`currency_symbol\` varchar(255) NOT NULL, \`chain_id\` bigint NOT NULL, \`multi_call_address\` varchar(255) NOT NULL, \`http\` text NOT NULL, \`block_time_sec\` int NOT NULL, \`explorer_url\` varchar(255) NOT NULL, INDEX \`idx_network_1\` (\`chain_id\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`abi\` (\`id\` bigint NOT NULL AUTO_INCREMENT, \`address\` varchar(255) NOT NULL, \`data\` longtext NOT NULL, \`network_id\` bigint NOT NULL, UNIQUE INDEX \`idx_abi_1\` (\`network_id\`, \`address\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`scheduler_config\` (\`id\` bigint NOT NULL AUTO_INCREMENT, \`key\` varchar(255) NOT NULL, \`value\` varchar(255) NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`scheduler\` (\`status\` tinyint NOT NULL DEFAULT 1, \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at\` timestamp NULL, \`id\` char(36) NOT NULL, \`type\` varchar(255) NOT NULL, \`identity\` varchar(255) NOT NULL, \`cron\` varchar(255) NOT NULL, \`block_number\` int NULL DEFAULT '0', \`pid\` int NULL, \`error\` tinyint NOT NULL DEFAULT 0, \`process\` tinyint NOT NULL DEFAULT '0', PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`farm_stake_tokens_token\` (\`farm_id\` bigint NOT NULL, \`token_id\` bigint NOT NULL, INDEX \`IDX_ec2b3bc8292885c52c917866cc\` (\`farm_id\`), INDEX \`IDX_a29e354121c2ac0c1cd61adcff\` (\`token_id\`), PRIMARY KEY (\`farm_id\`, \`token_id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`farm_reward_tokens_token\` (\`farm_id\` bigint NOT NULL, \`token_id\` bigint NOT NULL, INDEX \`IDX_94aace8ec8f6b5cbc5215799a6\` (\`farm_id\`), INDEX \`IDX_c70b5c07e9d491661e66d28738\` (\`token_id\`), PRIMARY KEY (\`farm_id\`, \`token_id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`nf_token\` ADD CONSTRAINT \`fk_372b1d2e3f705c8833bf863e194186ff\` FOREIGN KEY (\`protocol_id\`) REFERENCES \`protocol\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`lending\` ADD CONSTRAINT \`fk_94212edac76f952bbbd45133ce016a9f\` FOREIGN KEY (\`protocol_id\`) REFERENCES \`protocol\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`lending\` ADD CONSTRAINT \`fk_4f14cbd162a9015e37543c4c94b7da90\` FOREIGN KEY (\`token_id\`) REFERENCES \`token\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`protocol\` ADD CONSTRAINT \`fk_b60cdb9600e5cc29ccd84ba90322b934\` FOREIGN KEY (\`network_id\`) REFERENCES \`network\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`protocol\` ADD CONSTRAINT \`fk_3549e0dddbc942ebf27f0a67dc1af2f0\` FOREIGN KEY (\`token_id\`) REFERENCES \`token\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`farm\` ADD CONSTRAINT \`fk_f3048cacecfb6c1e06428e06536adec1\` FOREIGN KEY (\`protocol_id\`) REFERENCES \`protocol\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`token\` ADD CONSTRAINT \`fk_0d7285f750b208cc9e6b9f1dba7f16c0\` FOREIGN KEY (\`network_id\`) REFERENCES \`network\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`token\` ADD CONSTRAINT \`fk_9d9fb2e731bf7b90709245f2aba1e1f9\` FOREIGN KEY (\`pair0_id\`) REFERENCES \`token\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`token\` ADD CONSTRAINT \`fk_d09b95e13a44a10f5762fc338a806a25\` FOREIGN KEY (\`pair1_id\`) REFERENCES \`token\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`token\` ADD CONSTRAINT \`fk_e232528473589af2e131a0eebcc67030\` FOREIGN KEY (\`wrapped_id\`) REFERENCES \`token\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`interaction\` ADD CONSTRAINT \`fk_1a24a38555dfd8558b4bf1f381184984\` FOREIGN KEY (\`network_id\`) REFERENCES \`network\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`abi\` ADD CONSTRAINT \`fk_f4020e5fd7ecc598ce980e6f3fb564e1\` FOREIGN KEY (\`network_id\`) REFERENCES \`network\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`farm_stake_tokens_token\` ADD CONSTRAINT \`fk_39af0b480ca6a8fe6198d974812d4b2c\` FOREIGN KEY (\`farm_id\`) REFERENCES \`farm\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE \`farm_stake_tokens_token\` ADD CONSTRAINT \`fk_59f6074c7ecd813f3afd649e6b6d8f60\` FOREIGN KEY (\`token_id\`) REFERENCES \`token\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`farm_reward_tokens_token\` ADD CONSTRAINT \`fk_65eb53797dbc9edd543b286f7523ab6d\` FOREIGN KEY (\`farm_id\`) REFERENCES \`farm\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE \`farm_reward_tokens_token\` ADD CONSTRAINT \`fk_d092a81180f7ec6c49a1950e1925fb3c\` FOREIGN KEY (\`token_id\`) REFERENCES \`token\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`farm_reward_tokens_token\` DROP FOREIGN KEY \`fk_d092a81180f7ec6c49a1950e1925fb3c\``);
        await queryRunner.query(`ALTER TABLE \`farm_reward_tokens_token\` DROP FOREIGN KEY \`fk_65eb53797dbc9edd543b286f7523ab6d\``);
        await queryRunner.query(`ALTER TABLE \`farm_stake_tokens_token\` DROP FOREIGN KEY \`fk_59f6074c7ecd813f3afd649e6b6d8f60\``);
        await queryRunner.query(`ALTER TABLE \`farm_stake_tokens_token\` DROP FOREIGN KEY \`fk_39af0b480ca6a8fe6198d974812d4b2c\``);
        await queryRunner.query(`ALTER TABLE \`abi\` DROP FOREIGN KEY \`fk_f4020e5fd7ecc598ce980e6f3fb564e1\``);
        await queryRunner.query(`ALTER TABLE \`interaction\` DROP FOREIGN KEY \`fk_1a24a38555dfd8558b4bf1f381184984\``);
        await queryRunner.query(`ALTER TABLE \`token\` DROP FOREIGN KEY \`fk_e232528473589af2e131a0eebcc67030\``);
        await queryRunner.query(`ALTER TABLE \`token\` DROP FOREIGN KEY \`fk_d09b95e13a44a10f5762fc338a806a25\``);
        await queryRunner.query(`ALTER TABLE \`token\` DROP FOREIGN KEY \`fk_9d9fb2e731bf7b90709245f2aba1e1f9\``);
        await queryRunner.query(`ALTER TABLE \`token\` DROP FOREIGN KEY \`fk_0d7285f750b208cc9e6b9f1dba7f16c0\``);
        await queryRunner.query(`ALTER TABLE \`farm\` DROP FOREIGN KEY \`fk_f3048cacecfb6c1e06428e06536adec1\``);
        await queryRunner.query(`ALTER TABLE \`protocol\` DROP FOREIGN KEY \`fk_3549e0dddbc942ebf27f0a67dc1af2f0\``);
        await queryRunner.query(`ALTER TABLE \`protocol\` DROP FOREIGN KEY \`fk_b60cdb9600e5cc29ccd84ba90322b934\``);
        await queryRunner.query(`ALTER TABLE \`lending\` DROP FOREIGN KEY \`fk_4f14cbd162a9015e37543c4c94b7da90\``);
        await queryRunner.query(`ALTER TABLE \`lending\` DROP FOREIGN KEY \`fk_94212edac76f952bbbd45133ce016a9f\``);
        await queryRunner.query(`ALTER TABLE \`nf_token\` DROP FOREIGN KEY \`fk_372b1d2e3f705c8833bf863e194186ff\``);
        await queryRunner.query(`DROP INDEX \`IDX_c70b5c07e9d491661e66d28738\` ON \`farm_reward_tokens_token\``);
        await queryRunner.query(`DROP INDEX \`IDX_94aace8ec8f6b5cbc5215799a6\` ON \`farm_reward_tokens_token\``);
        await queryRunner.query(`DROP TABLE \`farm_reward_tokens_token\``);
        await queryRunner.query(`DROP INDEX \`IDX_a29e354121c2ac0c1cd61adcff\` ON \`farm_stake_tokens_token\``);
        await queryRunner.query(`DROP INDEX \`IDX_ec2b3bc8292885c52c917866cc\` ON \`farm_stake_tokens_token\``);
        await queryRunner.query(`DROP TABLE \`farm_stake_tokens_token\``);
        await queryRunner.query(`DROP TABLE \`scheduler\``);
        await queryRunner.query(`DROP TABLE \`scheduler_config\``);
        await queryRunner.query(`DROP INDEX \`idx_abi_1\` ON \`abi\``);
        await queryRunner.query(`DROP TABLE \`abi\``);
        await queryRunner.query(`DROP INDEX \`idx_network_1\` ON \`network\``);
        await queryRunner.query(`DROP TABLE \`network\``);
        await queryRunner.query(`DROP INDEX \`IDX_50f3f151e3b67e25cbd951aa27\` ON \`interaction\``);
        await queryRunner.query(`DROP INDEX \`idx_interaction_1\` ON \`interaction\``);
        await queryRunner.query(`DROP INDEX \`idx_interaction_2\` ON \`interaction\``);
        await queryRunner.query(`DROP TABLE \`interaction\``);
        await queryRunner.query(`DROP INDEX \`REL_d320e3ab211b71e5caae7cd61e\` ON \`token\``);
        await queryRunner.query(`DROP INDEX \`idx_token_1\` ON \`token\``);
        await queryRunner.query(`DROP TABLE \`token\``);
        await queryRunner.query(`DROP INDEX \`idx_farm_1\` ON \`farm\``);
        await queryRunner.query(`DROP INDEX \`idx_farm_2\` ON \`farm\``);
        await queryRunner.query(`DROP INDEX \`idx_farm_3\` ON \`farm\``);
        await queryRunner.query(`DROP TABLE \`farm\``);
        await queryRunner.query(`DROP INDEX \`REL_a46cc48987a816645ec5e2b42c\` ON \`protocol\``);
        await queryRunner.query(`DROP TABLE \`protocol\``);
        await queryRunner.query(`DROP INDEX \`idx_lending_1\` ON \`lending\``);
        await queryRunner.query(`DROP INDEX \`idx_lending_2\` ON \`lending\``);
        await queryRunner.query(`DROP INDEX \`idx_lending_3\` ON \`lending\``);
        await queryRunner.query(`DROP TABLE \`lending\``);
        await queryRunner.query(`DROP INDEX \`idx_nfToken_1\` ON \`nf_token\``);
        await queryRunner.query(`DROP TABLE \`nf_token\``);
    }

}
