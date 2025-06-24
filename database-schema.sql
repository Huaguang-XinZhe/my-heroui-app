-- =============================================
-- 邮件系统数据库结构重构
-- =============================================

-- 启用必要的扩展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- 1. 用户表
-- =============================================
CREATE TABLE users (
    id VARCHAR(100) PRIMARY KEY, -- 邮箱或卡密作为user_id
    nickname VARCHAR(100), -- 用户昵称
    avatar_url TEXT, -- 头像URL
    user_type VARCHAR(30) NOT NULL CHECK (user_type IN ('oauth2-google', 'oauth2-linuxdo', 'card_key', 'system')), -- 用户类型：oauth2-google、oauth2-linuxdo、card_key 或 system
    level INTEGER DEFAULT NULL, -- Linux DO 信任等级（仅 oauth2-linuxdo 用户有此字段）
    created_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() AT TIME ZONE 'Asia/Shanghai'), -- 北京时间
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() AT TIME ZONE 'Asia/Shanghai')
);

-- 用户表索引
CREATE INDEX idx_users_user_type ON users(user_type);

-- =============================================
-- 2. 重构的 mail_accounts 表
-- =============================================
CREATE TABLE mail_accounts (
    email VARCHAR(100) PRIMARY KEY, -- 邮箱地址
    user_id VARCHAR(100) NOT NULL REFERENCES users(id) ON DELETE CASCADE, -- 关联用户ID
    refresh_token TEXT, -- 刷新令牌
    client_id VARCHAR(100), -- 客户端ID
    service_provider VARCHAR(50) DEFAULT 'MICROSOFT', -- 服务提供商
    protocol_type VARCHAR(20) DEFAULT 'UNKNOWN' CHECK (protocol_type IN ('IMAP', 'GRAPH', 'UNKNOWN')), -- 协议类型
    password VARCHAR(255), -- 密码
    secondary_email VARCHAR(100), -- 辅助邮箱
    secondary_password VARCHAR(255), -- 辅助邮箱密码
    is_banned BOOLEAN DEFAULT FALSE, -- 是否被封禁
    refresh_token_updated_at TIMESTAMP WITH TIME ZONE DEFAULT NULL, -- refresh_token 更新时间
    created_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() AT TIME ZONE 'Asia/Shanghai') -- 北京时间
);

-- mail_accounts 表索引
CREATE INDEX idx_mail_accounts_user_id ON mail_accounts(user_id);
CREATE INDEX idx_mail_accounts_is_banned ON mail_accounts(is_banned);
CREATE INDEX idx_mail_accounts_service_provider ON mail_accounts(service_provider);
CREATE INDEX idx_mail_accounts_refresh_token_updated_at ON mail_accounts(refresh_token_updated_at);

-- =============================================
-- 3. 重构的 stored_mails 表
-- =============================================
CREATE TABLE stored_mails (
    id VARCHAR(255) PRIMARY KEY, -- 邮件唯一标识
    user_id VARCHAR(100) NOT NULL REFERENCES users(id) ON DELETE CASCADE, -- 关联用户ID
    subject TEXT, -- 邮件主题
    from_name VARCHAR(255), -- 发件人姓名
    from_address VARCHAR(255) NOT NULL, -- 发件人地址
    to_name VARCHAR(255), -- 收件人姓名
    to_address VARCHAR(255) NOT NULL, -- 收件人地址
    text_content TEXT, -- 文本内容
    html_content TEXT, -- HTML内容
    from_junk BOOLEAN DEFAULT FALSE, -- 是否来自垃圾邮件（替代原来的mail_type）
    received_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() AT TIME ZONE 'Asia/Shanghai'), -- 接收时间（北京时间）
    created_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() AT TIME ZONE 'Asia/Shanghai') -- 创建时间（北京时间）
);

-- stored_mails 表索引
CREATE INDEX idx_stored_mails_user_id ON stored_mails(user_id);
CREATE INDEX idx_stored_mails_to_address ON stored_mails(to_address); -- 通过收件人地址定位用户
CREATE INDEX idx_stored_mails_from_junk ON stored_mails(from_junk);
CREATE INDEX idx_stored_mails_received_at ON stored_mails(received_at);

-- stored_mails 表外键约束
ALTER TABLE stored_mails ADD CONSTRAINT fk_stored_mails_to_address 
    FOREIGN KEY (to_address) REFERENCES mail_accounts(email) ON DELETE CASCADE;

-- =============================================
-- 4. 自动更新时间戳的触发器
-- =============================================

-- 创建更新时间戳的函数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW() AT TIME ZONE 'Asia/Shanghai';
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 为各表添加更新时间戳触发器
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 创建 refresh_token 更新时间戳的触发器函数
CREATE OR REPLACE FUNCTION update_refresh_token_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    -- 只有当 refresh_token 字段被更新时才更新时间戳
    IF OLD.refresh_token IS DISTINCT FROM NEW.refresh_token THEN
        NEW.refresh_token_updated_at = NOW() AT TIME ZONE 'Asia/Shanghai';
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 为 mail_accounts 表添加 refresh_token 更新触发器
CREATE TRIGGER update_mail_accounts_refresh_token_timestamp BEFORE UPDATE ON mail_accounts
    FOR EACH ROW EXECUTE FUNCTION update_refresh_token_timestamp();

-- =============================================
-- 5. 实用的查询函数
-- =============================================

-- 根据邮箱地址获取用户信息
CREATE OR REPLACE FUNCTION get_user_by_email(email_address TEXT)
RETURNS TABLE(user_id VARCHAR, nickname VARCHAR, user_type VARCHAR, avatar_url TEXT) AS $$
BEGIN
    RETURN QUERY
    SELECT DISTINCT u.id, u.nickname, u.user_type, u.avatar_url
    FROM users u
    JOIN mail_accounts ma ON u.id = ma.user_id
    WHERE ma.email = email_address AND ma.is_banned = FALSE;
END;
$$ LANGUAGE plpgsql;

-- 获取用户的最新邮件
CREATE OR REPLACE FUNCTION get_latest_mail_by_user(user_id_param VARCHAR)
RETURNS TABLE(
    id VARCHAR, subject TEXT, from_name VARCHAR, from_address VARCHAR,
    to_name VARCHAR, to_address VARCHAR, text_content TEXT, html_content TEXT,
    from_junk BOOLEAN, received_at TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT sm.id, sm.subject, sm.from_name, sm.from_address,
           sm.to_name, sm.to_address, sm.text_content, sm.html_content,
           sm.from_junk, sm.received_at
    FROM stored_mails sm
    WHERE sm.user_id = user_id_param
    ORDER BY sm.received_at DESC
    LIMIT 1;
END;
$$ LANGUAGE plpgsql;

-- 统计用户邮件数量
CREATE OR REPLACE FUNCTION get_user_mail_count(user_id_param VARCHAR)
RETURNS TABLE(total_count BIGINT, inbox_count BIGINT, junk_count BIGINT) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*) as total_count,
        COUNT(CASE WHEN from_junk = FALSE THEN 1 END) as inbox_count,
        COUNT(CASE WHEN from_junk = TRUE THEN 1 END) as junk_count
    FROM stored_mails
    WHERE user_id = user_id_param;
END;
$$ LANGUAGE plpgsql; 