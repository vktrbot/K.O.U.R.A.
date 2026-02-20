import IConnectionProfile from "../common/i-connection-profile";

export default interface IProfileConnectionStore {
    profiles: IConnectionProfile[];

    addConnectionProfile(profile: IConnectionProfile);
    updateProfileAtId(id: string, newProfile: IConnectionProfile);
    removeConnectionProfile(id: string);
    getProfileById(id: string): IConnectionProfile;
}