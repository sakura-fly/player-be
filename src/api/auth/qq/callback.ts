import express from '@libs/express'
import passport from 'passport'
import { RequestWithUser } from 'passport-qq'
import { authWrite, generateToken } from '@libs/auth'
import { BadRequest } from '@libs/error'

const router = express()

router.get('/', passport.authenticate('qq'), async (req, res, next) => {
    const _req: RequestWithUser = req as RequestWithUser
    const user = _req.user

    if (user._json.ret < 0) {
        throw new BadRequest(user._json.msg)
    }
    const data = _req.user._json
    const info = await authWrite(req, {
        unionid: _req.user.unionid,
        nickname: data.nickname,
        avatar: data.figureurl_qq_2,
        sourceData: data,
        from: 'qq',
    })
    const accesstoken = generateToken(info.id)
    if(req.query.open_client) {
        res.redirect(302, `musiclake://oauth?accesstoken=${accesstoken}`)
    } else {
        res.cookie('accesstoken', accesstoken, {
            expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        })
        res.send('登录成功')
    }
})

export default router
