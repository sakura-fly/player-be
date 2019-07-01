import express from '@libs/express'
import passport from 'passport'
import config from 'config'
import axios from 'axios'
import { Strategy as qqStrategy, StrategyOption } from 'passport-qq'
import { Strategy as WeiboStrategy } from 'passport-weibo'
import GitHubStrategy from 'passport-github2'
import qq from './auth/qq'
import weibo from './auth/weibo'
import github from './auth/github'

const router = express()
const qqStrategyOption: StrategyOption = config.get('qqStrategyOption')
const weiboStrategyOption: StrategyOption = config.get('weiboStrategyOption')
const githubStrategyOption: StrategyOption = config.get('githubStrategyOption')
const serializeUser = (user: any, done: Function) => {
    done(null, user)
}

passport.serializeUser(serializeUser)
passport.deserializeUser(serializeUser)

// QQ
passport.use(
    'qq',
    new qqStrategy(qqStrategyOption, async (accessToken, refreshToken, profile, done) => {
        // 获取unionID
        const data = await axios.get(`https://graph.qq.com/oauth2.0/me?access_token=${accessToken}&unionid=1`)
        const info = eval(`function callback(val){return val} ${data.data}`)
        done(null, {
            ...profile,
            unionid: info.unionid,
        })
    })
)
passport.use(
    'qq-open-client',
    new qqStrategy({
        ...qqStrategyOption,
        callbackURL: qqStrategyOption.callbackURL + '?open_client=true'
    }, async (accessToken, refreshToken, profile, done) => {
        // 获取unionID
        const data = await axios.get(`https://graph.qq.com/oauth2.0/me?access_token=${accessToken}&unionid=1`)
        const info = eval(`function callback(val){return val} ${data.data}`)
        done(null, {
            ...profile,
            unionid: info.unionid,
        })
    })
)
// 微博
passport.use(
    'weibo',
    new WeiboStrategy(weiboStrategyOption, async (accessToken, refreshToken, profile, done) => {
        done(null, profile)
    })
)
passport.use(
    'weibo-open-client',
    new WeiboStrategy({
        ...weiboStrategyOption,
        callbackURL: weiboStrategyOption.callbackURL + '?open_client=true'
    }, async (accessToken, refreshToken, profile, done) => {
        done(null, profile)
    })
)
// Github
passport.use(
    'github',
    new GitHubStrategy(githubStrategyOption, async (accessToken, refreshToken, profile, done) => {
        done(null, profile)
    })
)
passport.use(
    'github-open-client',
    new GitHubStrategy({
        ...githubStrategyOption,
        callbackURL: githubStrategyOption.callbackURL + '?open_client=true'
    }, async (accessToken, refreshToken, profile, done) => {
        done(null, profile)
    })
)

router.use(passport.initialize())
router.use(passport.session())
router.use('/qq', qq)
router.use('/weibo', weibo)
router.use('/github', github)

export default router
