const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../config/database');

/**
 * 회원가입
 * POST /api/auth/register
 */
router.post('/register', async (req, res) => {
    try {
        const { email, password, nickname, phone } = req.body;

        // 입력 검증
        if (!email || !password || !nickname) {
            return res.status(400).json({
                error: '이메일, 비밀번호, 닉네임은 필수입니다'
            });
        }

        // 비밀번호 해시
        const passwordHash = await bcrypt.hash(password, 10);

        // 사용자 생성
        const [result] = await pool.query(
            'INSERT INTO users (email, password_hash, nickname, phone) VALUES (?, ?, ?, ?)',
            [email, passwordHash, nickname, phone || null]
        );

        // 첫 가입 보상 포인트 지급
        const userId = result.insertId;
        await pool.query(
            'UPDATE users SET point = 100 WHERE user_id = ?',
            [userId]
        );

        // 포인트 이력 기록
        await pool.query(
            `INSERT INTO user_points (user_id, points, activity_type, description, balance_after)
            VALUES (?, 100, 'REWARD', '회원가입 축하 포인트', 100)`,
            [userId]
        );

        res.status(201).json({
            success: true,
            message: '회원가입이 완료되었습니다',
            data: {
                user_id: userId,
                email,
                nickname
            }
        });
    } catch (error) {
        console.error('회원가입 오류:', error);

        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({
                error: '이미 존재하는 이메일 또는 닉네임입니다'
            });
        }

        res.status(500).json({
            error: '회원가입 중 오류가 발생했습니다'
        });
    }
});

/**
 * 로그인
 * POST /api/auth/login
 */
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                error: '이메일과 비밀번호를 입력해주세요'
            });
        }

        // 사용자 조회
        const [users] = await pool.query(
            'SELECT * FROM users WHERE email = ?',
            [email]
        );

        if (users.length === 0) {
            return res.status(401).json({
                error: '이메일 또는 비밀번호가 일치하지 않습니다'
            });
        }

        const user = users[0];

        // 비밀번호 확인
        const isValidPassword = await bcrypt.compare(password, user.password_hash);

        if (!isValidPassword) {
            return res.status(401).json({
                error: '이메일 또는 비밀번호가 일치하지 않습니다'
            });
        }

        // JWT 토큰 생성
        const token = jwt.sign(
            { userId: user.user_id, email: user.email },
            process.env.JWT_SECRET || 'default_secret_key',
            { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
        );

        res.json({
            success: true,
            message: '로그인 성공',
            data: {
                token,
                user: {
                    user_id: user.user_id,
                    email: user.email,
                    nickname: user.nickname,
                    point: user.point,
                    trust_score: user.trust_score
                }
            }
        });
    } catch (error) {
        console.error('로그인 오류:', error);
        res.status(500).json({
            error: '로그인 중 오류가 발생했습니다'
        });
    }
});

module.exports = router;
