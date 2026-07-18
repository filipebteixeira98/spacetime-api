import axios, { type AxiosResponse } from 'axios'
import type { FastifyInstance } from 'fastify'
import { z } from 'zod'

import { prisma } from '../lib/prisma'

interface GithubAccessTokenResponse {
  access_token: string
}

export async function authRoutes(app: FastifyInstance) {
  app.post('/register', async (request, reply) => {
    const bodySchema = z.object({
      code: z.string(),
      codeVerifier: z.string(),
      redirectUri: z.string().url(),
    })

    const { code, codeVerifier, redirectUri } = bodySchema.parse(request.body)

    let accessTokenResponse: AxiosResponse<GithubAccessTokenResponse>

    try {
      accessTokenResponse = await axios.post<GithubAccessTokenResponse>(
        'https://github.com/login/oauth/access_token',
        null,
        {
          params: {
            client_id: process.env.GITHUB_CLIENT_ID,
            client_secret: process.env.GITHUB_CLIENT_SECRET,
            code,
            code_verifier: codeVerifier,
            redirect_uri: redirectUri,
          },
          headers: {
            Accept: 'application/json',
          },
        },
      )
    } catch (error) {
      if (axios.isAxiosError(error)) {
        return reply.status(400).send({
          message: 'GitHub token exchange failed',
          github: error.response?.data,
        })
      }

      throw error
    }

    const { access_token } = accessTokenResponse.data

    const userResponse = await axios.get('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    })

    const userSchema = z.object({
      id: z.number(),
      login: z.string(),
      name: z.string(),
      avatar_url: z.string().url(),
    })

    const userInfo = userSchema.parse(userResponse.data)

    let user = await prisma.user.findUnique({
      where: {
        githubId: userInfo.id,
      },
    })

    if (!user) {
      user = await prisma.user.create({
        data: {
          githubId: userInfo.id,
          login: userInfo.login,
          name: userInfo.name,
          avatarUrl: userInfo.avatar_url,
        },
      })
    }

    const token = app.jwt.sign(
      {
        name: user.name,
        avatarUrl: user.avatarUrl,
      },
      {
        sub: user.id,
        expiresIn: '30 days',
      },
    )

    return {
      token,
    }
  })
}
