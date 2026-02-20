import IConnectionProfile from "@/interfaces/common/i-connection-profile";
import IProfileConnectionStore from "@/interfaces/services/i-profile-connection-store";
import { action, makeAutoObservable, observable } from "mobx";

export default class ConnectionProfileStore implements IProfileConnectionStore {

    private _profiles: IConnectionProfile[];

    constructor() {
        this._profiles = [];
        makeAutoObservable(this);
    }

    public get profiles() {
        return this._profiles;
    }

    @action
    public addConnectionProfile(profile: IConnectionProfile) { // as extension add result status of addition. If it fails, need to send message, what failed
        if(profile === undefined) return;
        if(this._profiles.some(p => p.id === profile.id)) return; // same connection exists
        this._profiles.push(observable(profile));
    }

    @action
    public removeConnectionProfile(id: string) {
        if(id === undefined || id.length < 1) return;
        this._profiles = this._profiles.filter(profile => profile.id !== id);
    }

    @action
    public updateProfileAtId(id: string, newProfile: IConnectionProfile) {
        if(id === undefined || id.length < 1) return;
        if(newProfile === undefined) return;
        this.removeConnectionProfile(id);
        this.addConnectionProfile(newProfile);
    }

    public getProfileById(id: string): IConnectionProfile {
        return this._profiles.find(profile => profile.id === id);
    }
}