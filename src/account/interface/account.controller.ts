import { inject } from 'inversify';
import { Controller } from '../../common/framework/controller';
import { Get, Patch, Post } from '../../common/framework/route-function';
import { AccountService } from '../business/account.service';
import { UserId } from '../domain/user-id';
import { LoginBody } from './login.body';
import { RegisterBody } from './register.body';
import { FollowBody } from './follow.body';
import { UnfollowBody } from './unfollow.body';

@Controller('/account')
export class AccountController {
  constructor(
    @inject('AccountService')
    private readonly accountService: AccountService,
  ) {}

  @Post('/register', RegisterBody)
  public async register(req, res) {
    const { email, password, name } = req.body;

    await this.accountService.register(email, password, name);

    const account = await this.accountService.getAccount(email);

    res.send({
      email,
      password,
      name,
      id: account.id.toString(),
    });
  }

  @Post('/login', LoginBody)
  public async login(req, res) {
    const { email, password } = req.body;

    const isLoggedIn = await this.accountService.login(email, password);

    if (isLoggedIn) {
      res.send('OK');
    } else {
      res.status(404).send('NO');
    }
  }

  @Get('/:email')
  public async getAccount(req, res) {
    const { email } = req.params;

    const account = await this.accountService.getAccount(email);

    res.send({
      id: account.id.toString(),
      email: account.email,
      following: account.following.map((id) => id.toString()),
    });
  }

  @Patch('/follow', FollowBody)
  public async follow(req, res) {
    const { follower, following } = req.body;

    try {
      await this.accountService.follow(
        new UserId(follower),
        new UserId(following),
      );
      res.send('OK');
    } catch (err) {
      res.status(400).send('Bad Request');
    }
  }

  @Patch('/unfollow', UnfollowBody)
  public async unfollow(req, res) {
    const { follower, following } = req.body;

    try {
      await this.accountService.unfollow(
        new UserId(follower),
        new UserId(following),
      );
      res.send('OK');
    } catch (err) {
      res.status(400).send('Bad Request');
    }
  }
}
