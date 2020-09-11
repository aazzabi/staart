import {
  RESOURCE_CREATED,
  RESOURCE_DELETED,
  RESOURCE_UPDATED,
  respond,
} from "@staart/messages";
import {
  ClassMiddleware,
  Delete,
  Get,
  Middleware,
  Patch,
  Put,
  Request,
  Response,
} from "@staart/server";
import { Joi, joiValidate } from "@staart/validate";
import { authHandler, validator } from "../../../_staart/helpers/middleware";
import { twtToId } from "../../../_staart/helpers/utils";
import {
  createAccessTokenForUser,
  deleteAccessTokenForUser,
  getUserAccessTokenForUser,
  getUserAccessTokensForUser,
  updateAccessTokenForUser,
  getUserAccessTokenScopesForUser,
} from "../../../_staart/rest/user";

@ClassMiddleware(authHandler)
export class UserAccessTokensController {
  @Get()
  async getUserAccessTokens(req: Request, res: Response) {
    const id = twtToId(req.params.id, res.locals.token.id);
    joiValidate({ id: Joi.number().required() }, { id });
    return getUserAccessTokensForUser(
      twtToId(res.locals.token.id),
      id,
      req.query
    );
  }

  @Put()
  @Middleware(
    validator(
      {
        scopes: Joi.array().items(Joi.string()),
        name: Joi.string(),
        description: Joi.string(),
      },
      "body"
    )
  )
  async putUserAccessTokens(req: Request, res: Response) {
    const id = twtToId(req.params.id, res.locals.token.id);
    joiValidate({ id: Joi.number().required() }, { id });
    try {
      const added = await createAccessTokenForUser(
        twtToId(res.locals.token.id),
        id,
        req.body,
        res.locals
      );
      return { ...respond(RESOURCE_CREATED), added };
    } catch (error) {
      console.log(error);
      return {};
    }
  }

  @Get(":accessTokenId")
  async getUserAccessToken(req: Request, res: Response) {
    const id = twtToId(req.params.id, res.locals.token.id);
    const accessTokenId = twtToId(req.params.accessTokenId);
    joiValidate(
      {
        id: Joi.number().required(),
        accessTokenId: Joi.number().required(),
      },
      { id, accessTokenId }
    );
    return getUserAccessTokenForUser(
      twtToId(res.locals.token.id),
      id,
      accessTokenId
    );
  }

  @Patch(":accessTokenId")
  @Middleware(
    validator(
      {
        scopes: Joi.array().items(Joi.string()).allow(null),
        name: Joi.string().allow(null),
        description: Joi.string().allow(null),
      },
      "body"
    )
  )
  async patchUserAccessToken(req: Request, res: Response) {
    const id = twtToId(req.params.id, res.locals.token.id);
    const accessTokenId = twtToId(req.params.accessTokenId);
    joiValidate(
      {
        id: Joi.number().required(),
        accessTokenId: Joi.number().required(),
      },
      { id, accessTokenId }
    );
    const updated = await updateAccessTokenForUser(
      twtToId(res.locals.token.id),
      id,
      accessTokenId,
      req.body,
      res.locals
    );
    return { ...respond(RESOURCE_UPDATED), updated };
  }

  @Delete(":accessTokenId")
  async deleteUserAccessToken(req: Request, res: Response) {
    const id = twtToId(req.params.id, res.locals.token.id);
    const accessTokenId = twtToId(req.params.accessTokenId);
    joiValidate(
      {
        id: Joi.number().required(),
        accessTokenId: Joi.number().required(),
      },
      { id, accessTokenId }
    );
    await deleteAccessTokenForUser(
      twtToId(res.locals.token.id),
      id,
      accessTokenId,
      res.locals
    );
    return respond(RESOURCE_DELETED);
  }
}
