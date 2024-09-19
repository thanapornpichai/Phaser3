import { Server } from "./server";
import { User } from "./user";

export class Lobby
{
  private users: Map<number, User>;

  public constructor(_server: Server)
  {
    this.users = new Map<number, User>();
  }

  public addUser(user: User) {
     for (const [playerId, player] of this.users) {
         user.sendEnterUser(player);
     }
     this.broadcast((playerId, player) => player.sendEnterUser(user));
     user.sendEnterUser(user);
     this.users.set(user.getUserId(), user);
  }

    public removeUser(user: User) {
        this.broadcast((playerId, player) => {
            player.sendRemoveUser(user);
        });

        this.users.delete(user.getUserId());
    }

  public getUser(userId: number)
  {
    return this.users.get(userId);
  }

  public chat(sender: User, message: string)
  {
    this.broadcast((playerId, player) => {
      player.sendChat(sender.getUserId(), sender.getUserData().displayName, message)
    });
  }

    public privateChat(sender: User, userId: number, message: string) {
        const receiver = this.getUser(userId);

        if (receiver) {
            receiver.doPrivateChat(sender.getUserId(), message);
            sender.sendChat(sender.getUserId(), sender.getUserData().displayName, message);
        } else {
            console.log("No User");
        }
    }

  private broadcast(handler: (playerId: number, player: User) => void)
  {
    for (const [id, player] of this.users)
    {
      if (player !== undefined)
      {
        handler(id, player);
      }
    }
  }

  public close()
  {
    this.users.clear();
  }
}