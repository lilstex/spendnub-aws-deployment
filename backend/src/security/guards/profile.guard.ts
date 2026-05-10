import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Profile } from 'src/user/schema/profile.schema';

// profile.guard.ts
@Injectable()
export class ProfileGuard implements CanActivate {
  constructor(
    @InjectModel(Profile.name) private profileModel: Model<Profile>,
  ) {}
  async canActivate(ctx: ExecutionContext) {
    const req = ctx.switchToHttp().getRequest();
    const profileId = req.headers['x-profile-id'];
    if (profileId) {
      // Verify this profile belongs to the user
      const profile = await this.profileModel.findOne({
        _id: profileId,
        ownerId: req.user.id,
      });
      if (!profile) throw new ForbiddenException('Profile not found');
      req.profileId = profileId;
    } else {
      // Use default profile
      const def = await this.profileModel.findOne({
        ownerId: req.user.id,
        isDefault: true,
      });
      req.profileId = def?._id?.toString() ?? null;
    }
    return true;
  }
}
