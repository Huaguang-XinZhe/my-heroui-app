-- ============================================
-- Supabase 卡密验证系统数据库设置脚本
-- ============================================

-- 1. 创建邮箱表
CREATE TABLE IF NOT EXISTS emails (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    type VARCHAR(20) NOT NULL CHECK (type IN ('short_term', 'long_term')),
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    notes TEXT
);

-- 2. 创建卡密验证日志表
CREATE TABLE IF NOT EXISTS card_verification_logs (
    id BIGSERIAL PRIMARY KEY,
    card_key VARCHAR(255) NOT NULL,
    user_id VARCHAR(100) NOT NULL,
    verified_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    email_count INTEGER NOT NULL DEFAULT 0,
    duration VARCHAR(20) NOT NULL CHECK (duration IN ('短效', '长效')),
    source VARCHAR(50) NOT NULL,
    custom_source VARCHAR(50),
    ip_address INET,
    user_agent TEXT
);

-- 3. 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_emails_type_status ON emails(type, status);
CREATE INDEX IF NOT EXISTS idx_emails_status ON emails(status);
CREATE INDEX IF NOT EXISTS idx_verification_logs_user_id ON card_verification_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_verification_logs_verified_at ON card_verification_logs(verified_at);
CREATE INDEX IF NOT EXISTS idx_verification_logs_card_key ON card_verification_logs(card_key);

-- 4. 创建更新时间的触发器函数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 5. 为邮箱表添加自动更新时间戳的触发器
CREATE TRIGGER update_emails_updated_at 
    BEFORE UPDATE ON emails 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- 6. 插入短效邮箱测试数据
INSERT INTO emails (email, type, status, notes) VALUES
-- 短效邮箱 (100个)
('short001@temp-mail.com', 'short_term', 'active', '测试短效邮箱'),
('short002@temp-mail.com', 'short_term', 'active', '测试短效邮箱'),
('short003@temp-mail.com', 'short_term', 'active', '测试短效邮箱'),
('short004@temp-mail.com', 'short_term', 'active', '测试短效邮箱'),
('short005@temp-mail.com', 'short_term', 'active', '测试短效邮箱'),
('short006@temp-mail.com', 'short_term', 'active', '测试短效邮箱'),
('short007@temp-mail.com', 'short_term', 'active', '测试短效邮箱'),
('short008@temp-mail.com', 'short_term', 'active', '测试短效邮箱'),
('short009@temp-mail.com', 'short_term', 'active', '测试短效邮箱'),
('short010@temp-mail.com', 'short_term', 'active', '测试短效邮箱'),
('short011@temp-mail.com', 'short_term', 'active', '测试短效邮箱'),
('short012@temp-mail.com', 'short_term', 'active', '测试短效邮箱'),
('short013@temp-mail.com', 'short_term', 'active', '测试短效邮箱'),
('short014@temp-mail.com', 'short_term', 'active', '测试短效邮箱'),
('short015@temp-mail.com', 'short_term', 'active', '测试短效邮箱'),
('short016@temp-mail.com', 'short_term', 'active', '测试短效邮箱'),
('short017@temp-mail.com', 'short_term', 'active', '测试短效邮箱'),
('short018@temp-mail.com', 'short_term', 'active', '测试短效邮箱'),
('short019@temp-mail.com', 'short_term', 'active', '测试短效邮箱'),
('short020@temp-mail.com', 'short_term', 'active', '测试短效邮箱'),
('short021@temp-mail.com', 'short_term', 'active', '测试短效邮箱'),
('short022@temp-mail.com', 'short_term', 'active', '测试短效邮箱'),
('short023@temp-mail.com', 'short_term', 'active', '测试短效邮箱'),
('short024@temp-mail.com', 'short_term', 'active', '测试短效邮箱'),
('short025@temp-mail.com', 'short_term', 'active', '测试短效邮箱'),
('short026@temp-mail.com', 'short_term', 'active', '测试短效邮箱'),
('short027@temp-mail.com', 'short_term', 'active', '测试短效邮箱'),
('short028@temp-mail.com', 'short_term', 'active', '测试短效邮箱'),
('short029@temp-mail.com', 'short_term', 'active', '测试短效邮箱'),
('short030@temp-mail.com', 'short_term', 'active', '测试短效邮箱'),
('short031@temp-mail.com', 'short_term', 'active', '测试短效邮箱'),
('short032@temp-mail.com', 'short_term', 'active', '测试短效邮箱'),
('short033@temp-mail.com', 'short_term', 'active', '测试短效邮箱'),
('short034@temp-mail.com', 'short_term', 'active', '测试短效邮箱'),
('short035@temp-mail.com', 'short_term', 'active', '测试短效邮箱'),
('short036@temp-mail.com', 'short_term', 'active', '测试短效邮箱'),
('short037@temp-mail.com', 'short_term', 'active', '测试短效邮箱'),
('short038@temp-mail.com', 'short_term', 'active', '测试短效邮箱'),
('short039@temp-mail.com', 'short_term', 'active', '测试短效邮箱'),
('short040@temp-mail.com', 'short_term', 'active', '测试短效邮箱'),
('short041@temp-mail.com', 'short_term', 'active', '测试短效邮箱'),
('short042@temp-mail.com', 'short_term', 'active', '测试短效邮箱'),
('short043@temp-mail.com', 'short_term', 'active', '测试短效邮箱'),
('short044@temp-mail.com', 'short_term', 'active', '测试短效邮箱'),
('short045@temp-mail.com', 'short_term', 'active', '测试短效邮箱'),
('short046@temp-mail.com', 'short_term', 'active', '测试短效邮箱'),
('short047@temp-mail.com', 'short_term', 'active', '测试短效邮箱'),
('short048@temp-mail.com', 'short_term', 'active', '测试短效邮箱'),
('short049@temp-mail.com', 'short_term', 'active', '测试短效邮箱'),
('short050@temp-mail.com', 'short_term', 'active', '测试短效邮箱'),
('short051@10minutemail.com', 'short_term', 'active', '测试短效邮箱'),
('short052@10minutemail.com', 'short_term', 'active', '测试短效邮箱'),
('short053@10minutemail.com', 'short_term', 'active', '测试短效邮箱'),
('short054@10minutemail.com', 'short_term', 'active', '测试短效邮箱'),
('short055@10minutemail.com', 'short_term', 'active', '测试短效邮箱'),
('short056@10minutemail.com', 'short_term', 'active', '测试短效邮箱'),
('short057@10minutemail.com', 'short_term', 'active', '测试短效邮箱'),
('short058@10minutemail.com', 'short_term', 'active', '测试短效邮箱'),
('short059@10minutemail.com', 'short_term', 'active', '测试短效邮箱'),
('short060@10minutemail.com', 'short_term', 'active', '测试短效邮箱'),
('short061@guerrillamail.com', 'short_term', 'active', '测试短效邮箱'),
('short062@guerrillamail.com', 'short_term', 'active', '测试短效邮箱'),
('short063@guerrillamail.com', 'short_term', 'active', '测试短效邮箱'),
('short064@guerrillamail.com', 'short_term', 'active', '测试短效邮箱'),
('short065@guerrillamail.com', 'short_term', 'active', '测试短效邮箱'),
('short066@guerrillamail.com', 'short_term', 'active', '测试短效邮箱'),
('short067@guerrillamail.com', 'short_term', 'active', '测试短效邮箱'),
('short068@guerrillamail.com', 'short_term', 'active', '测试短效邮箱'),
('short069@guerrillamail.com', 'short_term', 'active', '测试短效邮箱'),
('short070@guerrillamail.com', 'short_term', 'active', '测试短效邮箱'),
('short071@mailinator.com', 'short_term', 'active', '测试短效邮箱'),
('short072@mailinator.com', 'short_term', 'active', '测试短效邮箱'),
('short073@mailinator.com', 'short_term', 'active', '测试短效邮箱'),
('short074@mailinator.com', 'short_term', 'active', '测试短效邮箱'),
('short075@mailinator.com', 'short_term', 'active', '测试短效邮箱'),
('short076@mailinator.com', 'short_term', 'active', '测试短效邮箱'),
('short077@mailinator.com', 'short_term', 'active', '测试短效邮箱'),
('short078@mailinator.com', 'short_term', 'active', '测试短效邮箱'),
('short079@mailinator.com', 'short_term', 'active', '测试短效邮箱'),
('short080@mailinator.com', 'short_term', 'active', '测试短效邮箱'),
('short081@throwaway.email', 'short_term', 'active', '测试短效邮箱'),
('short082@throwaway.email', 'short_term', 'active', '测试短效邮箱'),
('short083@throwaway.email', 'short_term', 'active', '测试短效邮箱'),
('short084@throwaway.email', 'short_term', 'active', '测试短效邮箱'),
('short085@throwaway.email', 'short_term', 'active', '测试短效邮箱'),
('short086@throwaway.email', 'short_term', 'active', '测试短效邮箱'),
('short087@throwaway.email', 'short_term', 'active', '测试短效邮箱'),
('short088@throwaway.email', 'short_term', 'active', '测试短效邮箱'),
('short089@throwaway.email', 'short_term', 'active', '测试短效邮箱'),
('short090@throwaway.email', 'short_term', 'active', '测试短效邮箱'),
('short091@yopmail.com', 'short_term', 'active', '测试短效邮箱'),
('short092@yopmail.com', 'short_term', 'active', '测试短效邮箱'),
('short093@yopmail.com', 'short_term', 'active', '测试短效邮箱'),
('short094@yopmail.com', 'short_term', 'active', '测试短效邮箱'),
('short095@yopmail.com', 'short_term', 'active', '测试短效邮箱'),
('short096@yopmail.com', 'short_term', 'active', '测试短效邮箱'),
('short097@yopmail.com', 'short_term', 'active', '测试短效邮箱'),
('short098@yopmail.com', 'short_term', 'active', '测试短效邮箱'),
('short099@yopmail.com', 'short_term', 'active', '测试短效邮箱'),
('short100@yopmail.com', 'short_term', 'active', '测试短效邮箱')
ON CONFLICT (email) DO NOTHING;

-- 7. 插入长效邮箱测试数据
INSERT INTO emails (email, type, status, notes) VALUES
-- 长效邮箱 (100个)
('long001@protonmail.com', 'long_term', 'active', '测试长效邮箱'),
('long002@protonmail.com', 'long_term', 'active', '测试长效邮箱'),
('long003@protonmail.com', 'long_term', 'active', '测试长效邮箱'),
('long004@protonmail.com', 'long_term', 'active', '测试长效邮箱'),
('long005@protonmail.com', 'long_term', 'active', '测试长效邮箱'),
('long006@protonmail.com', 'long_term', 'active', '测试长效邮箱'),
('long007@protonmail.com', 'long_term', 'active', '测试长效邮箱'),
('long008@protonmail.com', 'long_term', 'active', '测试长效邮箱'),
('long009@protonmail.com', 'long_term', 'active', '测试长效邮箱'),
('long010@protonmail.com', 'long_term', 'active', '测试长效邮箱'),
('long011@tutanota.com', 'long_term', 'active', '测试长效邮箱'),
('long012@tutanota.com', 'long_term', 'active', '测试长效邮箱'),
('long013@tutanota.com', 'long_term', 'active', '测试长效邮箱'),
('long014@tutanota.com', 'long_term', 'active', '测试长效邮箱'),
('long015@tutanota.com', 'long_term', 'active', '测试长效邮箱'),
('long016@tutanota.com', 'long_term', 'active', '测试长效邮箱'),
('long017@tutanota.com', 'long_term', 'active', '测试长效邮箱'),
('long018@tutanota.com', 'long_term', 'active', '测试长效邮箱'),
('long019@tutanota.com', 'long_term', 'active', '测试长效邮箱'),
('long020@tutanota.com', 'long_term', 'active', '测试长效邮箱'),
('long021@outlook.com', 'long_term', 'active', '测试长效邮箱'),
('long022@outlook.com', 'long_term', 'active', '测试长效邮箱'),
('long023@outlook.com', 'long_term', 'active', '测试长效邮箱'),
('long024@outlook.com', 'long_term', 'active', '测试长效邮箱'),
('long025@outlook.com', 'long_term', 'active', '测试长效邮箱'),
('long026@outlook.com', 'long_term', 'active', '测试长效邮箱'),
('long027@outlook.com', 'long_term', 'active', '测试长效邮箱'),
('long028@outlook.com', 'long_term', 'active', '测试长效邮箱'),
('long029@outlook.com', 'long_term', 'active', '测试长效邮箱'),
('long030@outlook.com', 'long_term', 'active', '测试长效邮箱'),
('long031@yahoo.com', 'long_term', 'active', '测试长效邮箱'),
('long032@yahoo.com', 'long_term', 'active', '测试长效邮箱'),
('long033@yahoo.com', 'long_term', 'active', '测试长效邮箱'),
('long034@yahoo.com', 'long_term', 'active', '测试长效邮箱'),
('long035@yahoo.com', 'long_term', 'active', '测试长效邮箱'),
('long036@yahoo.com', 'long_term', 'active', '测试长效邮箱'),
('long037@yahoo.com', 'long_term', 'active', '测试长效邮箱'),
('long038@yahoo.com', 'long_term', 'active', '测试长效邮箱'),
('long039@yahoo.com', 'long_term', 'active', '测试长效邮箱'),
('long040@yahoo.com', 'long_term', 'active', '测试长效邮箱'),
('long041@gmail.com', 'long_term', 'active', '测试长效邮箱'),
('long042@gmail.com', 'long_term', 'active', '测试长效邮箱'),
('long043@gmail.com', 'long_term', 'active', '测试长效邮箱'),
('long044@gmail.com', 'long_term', 'active', '测试长效邮箱'),
('long045@gmail.com', 'long_term', 'active', '测试长效邮箱'),
('long046@gmail.com', 'long_term', 'active', '测试长效邮箱'),
('long047@gmail.com', 'long_term', 'active', '测试长效邮箱'),
('long048@gmail.com', 'long_term', 'active', '测试长效邮箱'),
('long049@gmail.com', 'long_term', 'active', '测试长效邮箱'),
('long050@gmail.com', 'long_term', 'active', '测试长效邮箱'),
('long051@126.com', 'long_term', 'active', '测试长效邮箱'),
('long052@126.com', 'long_term', 'active', '测试长效邮箱'),
('long053@126.com', 'long_term', 'active', '测试长效邮箱'),
('long054@126.com', 'long_term', 'active', '测试长效邮箱'),
('long055@126.com', 'long_term', 'active', '测试长效邮箱'),
('long056@163.com', 'long_term', 'active', '测试长效邮箱'),
('long057@163.com', 'long_term', 'active', '测试长效邮箱'),
('long058@163.com', 'long_term', 'active', '测试长效邮箱'),
('long059@163.com', 'long_term', 'active', '测试长效邮箱'),
('long060@163.com', 'long_term', 'active', '测试长效邮箱'),
('long061@qq.com', 'long_term', 'active', '测试长效邮箱'),
('long062@qq.com', 'long_term', 'active', '测试长效邮箱'),
('long063@qq.com', 'long_term', 'active', '测试长效邮箱'),
('long064@qq.com', 'long_term', 'active', '测试长效邮箱'),
('long065@qq.com', 'long_term', 'active', '测试长效邮箱'),
('long066@qq.com', 'long_term', 'active', '测试长效邮箱'),
('long067@qq.com', 'long_term', 'active', '测试长效邮箱'),
('long068@qq.com', 'long_term', 'active', '测试长效邮箱'),
('long069@qq.com', 'long_term', 'active', '测试长效邮箱'),
('long070@qq.com', 'long_term', 'active', '测试长效邮箱'),
('long071@sina.com', 'long_term', 'active', '测试长效邮箱'),
('long072@sina.com', 'long_term', 'active', '测试长效邮箱'),
('long073@sina.com', 'long_term', 'active', '测试长效邮箱'),
('long074@sina.com', 'long_term', 'active', '测试长效邮箱'),
('long075@sina.com', 'long_term', 'active', '测试长效邮箱'),
('long076@sohu.com', 'long_term', 'active', '测试长效邮箱'),
('long077@sohu.com', 'long_term', 'active', '测试长效邮箱'),
('long078@sohu.com', 'long_term', 'active', '测试长效邮箱'),
('long079@sohu.com', 'long_term', 'active', '测试长效邮箱'),
('long080@sohu.com', 'long_term', 'active', '测试长效邮箱'),
('long081@foxmail.com', 'long_term', 'active', '测试长效邮箱'),
('long082@foxmail.com', 'long_term', 'active', '测试长效邮箱'),
('long083@foxmail.com', 'long_term', 'active', '测试长效邮箱'),
('long084@foxmail.com', 'long_term', 'active', '测试长效邮箱'),
('long085@foxmail.com', 'long_term', 'active', '测试长效邮箱'),
('long086@aliyun.com', 'long_term', 'active', '测试长效邮箱'),
('long087@aliyun.com', 'long_term', 'active', '测试长效邮箱'),
('long088@aliyun.com', 'long_term', 'active', '测试长效邮箱'),
('long089@aliyun.com', 'long_term', 'active', '测试长效邮箱'),
('long090@aliyun.com', 'long_term', 'active', '测试长效邮箱'),
('long091@hotmail.com', 'long_term', 'active', '测试长效邮箱'),
('long092@hotmail.com', 'long_term', 'active', '测试长效邮箱'),
('long093@hotmail.com', 'long_term', 'active', '测试长效邮箱'),
('long094@hotmail.com', 'long_term', 'active', '测试长效邮箱'),
('long095@hotmail.com', 'long_term', 'active', '测试长效邮箱'),
('long096@live.com', 'long_term', 'active', '测试长效邮箱'),
('long097@live.com', 'long_term', 'active', '测试长效邮箱'),
('long098@live.com', 'long_term', 'active', '测试长效邮箱'),
('long099@live.com', 'long_term', 'active', '测试长效邮箱'),
('long100@live.com', 'long_term', 'active', '测试长效邮箱')
ON CONFLICT (email) DO NOTHING;

-- 8. 创建一些示例验证日志（可选）
INSERT INTO card_verification_logs (card_key, user_id, email_count, duration, source) VALUES
('sk-1234example1', '测试用户1', 50, '短效', '淘宝'),
('sk-5678example2', '测试用户2', 100, '长效', '闲鱼'),
('sk-9abc example3', '测试用户1', 30, '短效', '内部'),
('sk-def0example4', '测试用户3', 200, '长效', '自定义')
ON CONFLICT DO NOTHING;

-- 9. 创建查询邮箱的视图（可选，方便查询）
CREATE OR REPLACE VIEW available_emails AS
SELECT 
    type,
    COUNT(*) as total_count,
    COUNT(CASE WHEN status = 'active' THEN 1 END) as active_count
FROM emails 
GROUP BY type;

-- 10. 创建用于批量获取邮箱的函数（可选，提高性能）
CREATE OR REPLACE FUNCTION get_emails_by_type_and_limit(
    email_type VARCHAR(20),
    email_limit INTEGER DEFAULT 10
)
RETURNS TABLE(email VARCHAR(255)) AS $$
BEGIN
    RETURN QUERY
    SELECT e.email
    FROM emails e
    WHERE e.type = email_type 
      AND e.status = 'active'
    ORDER BY e.created_at
    LIMIT email_limit;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 验证数据插入结果
-- ============================================

-- 查看插入的数据统计
SELECT 
    '邮箱数据统计' as info,
    type,
    status,
    COUNT(*) as count
FROM emails 
GROUP BY type, status
ORDER BY type, status;

-- 查看可用邮箱总数
SELECT * FROM available_emails;

-- 显示完成信息
SELECT 
    '数据库设置完成！' as message,
    '短效邮箱: ' || (SELECT COUNT(*) FROM emails WHERE type = 'short_term' AND status = 'active') as short_term_count,
    '长效邮箱: ' || (SELECT COUNT(*) FROM emails WHERE type = 'long_term' AND status = 'active') as long_term_count; 