-- =============================================
-- 数据库更新脚本 - 添加受邀人字段
-- =============================================

-- 为 users 表添加 invited_by 字段
ALTER TABLE users ADD COLUMN IF NOT EXISTS invited_by VARCHAR(100) DEFAULT NULL;

-- 添加注释
COMMENT ON COLUMN users.invited_by IS '受邀人，记录邀请者的用户ID';

-- 创建索引以优化查询性能
CREATE INDEX IF NOT EXISTS idx_users_invited_by ON users(invited_by);

-- 可选：如果需要外键约束（自引用）
-- ALTER TABLE users ADD CONSTRAINT fk_users_invited_by 
--     FOREIGN KEY (invited_by) REFERENCES users(id) ON DELETE SET NULL; 