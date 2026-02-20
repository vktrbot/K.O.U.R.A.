import React, { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { observer } from "mobx-react-lite";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  Wifi, 
  Plus, 
  Trash2, 
  Edit, 
  CheckCircle, 
  XCircle,
  Shield
} from "lucide-react";
import { getMainStore } from '@/store/main-store';
import ConnectionProfile from '@/components/ConnectionProfile';
import IConnectionProfile from '@/interfaces/common/i-connection-profile';
import { Callback } from '@/interfaces/common/types';


export default observer(function Connection() {
  const connectionProfiles = getMainStore().connectionProfiles;
  const connectionStore = getMainStore().connectionStore;
  const telemetryStore = getMainStore().telemetryStore;
  const [showForm, setShowForm] = useState(false);
  const [editingProfile, setEditingProfile] = useState<IConnectionProfile | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    connection_type: "wifi",
    host: "",
    port: "",
    auth_token: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingProfile) {
      connectionProfiles.updateProfileAtId(editingProfile.id, { ...editingProfile, ...formData, port: Number(formData.port) });
    } else {
      const newProfile: ConnectionProfile = new ConnectionProfile(
        Date.now().toString(), 
        formData.name, formData.connection_type, formData.host,
        Number(formData.port),
        formData.auth_token
      );
      connectionProfiles.addConnectionProfile(newProfile);
    }
    setShowForm(false);
    setEditingProfile(null);
    setFormData({ name: "", connection_type: "wifi", host: "", port: "", auth_token: "" });
  };

  const handleEdit = (profile: IConnectionProfile) => {
    setEditingProfile(profile);
    setFormData({
      name: profile.name,
      connection_type: profile.connection_type,
      host: profile.host,
      port: profile.port.toString(),
      auth_token: profile.auth_token || ""
    });
    setShowForm(true);
  };

  const handleDelete = (id: string) => connectionProfiles.removeConnectionProfile(id);

  const handleConnect = (id: string) => {
    const profile = connectionProfiles.getProfileById(id);
    if(profile === undefined) return;
    connectionStore.createConnection(profile);
    connectionProfiles.updateProfileAtId(id, profile);
    
  };

  useEffect(() => {
      const onConnected = {id: Date.now().toString(), callback: () => {
        telemetryStore.setStatus("ready");
      }} as Callback;
      const onStopped = {id: Date.now().toString(), callback: () => {
        telemetryStore.setStatus("offline");
      }} as Callback;
  
      const onConnectingId = connectionStore.onConnectionInitiated.registerListener(() => telemetryStore.setStatus("connecting"));
      const onEstablishedId = connectionStore.onConnectionEstablished.registerListener(() => telemetryStore.setStatus("ready"));
      const onStoppedId = connectionStore.onConnectionStopped.registerListener(() => telemetryStore.setStatus("offline"));
  
      return () => {
        connectionStore.onConnectionInitiated.unregisterListener(onConnectingId);
        connectionStore.onConnectionEstablished.unregisterListener(onEstablishedId);
        connectionStore.onConnectionStopped.unregisterListener(onStoppedId);
      }
    }, []);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Yhteyden hallinta</h1>
          <p className="text-gray-600 mt-1">Hallitse yhteysprofiileja</p>
        </div>
        <Button
          onClick={() => setShowForm(true)}
          className="bg-purple-600 hover:bg-purple-700 text-white font-bold"
        >
          <Plus className="w-5 h-5 mr-2" />
          Uusi profiili
        </Button>
      </div>

      {showForm && (
        <Card className="glass-card border-2 border-purple-200 shadow-lg">
          <CardHeader className="bg-purple-50 border-b border-purple-200">
            <CardTitle className="text-purple-700">
              {editingProfile ? 'Muokkaa profiilia' : 'Uusi yhteysprofiili'}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Profiilin nimi</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="esim. Kaivos"
                  required
                />
              </div>
              <div>
                <Label htmlFor="host">IP-osoite / Hostname</Label>
                <Input
                  id="host"
                  value={formData.host}
                  onChange={(e) => setFormData({ ...formData, host: e.target.value })}
                  placeholder="esim. 192.168.1.100"
                  required
                />
              </div>
              <div>
                <Label htmlFor="port">Portti</Label>
                <Input
                  id="port"
                  type="number"
                  value={formData.port}
                  onChange={(e) => setFormData({ ...formData, port: e.target.value })}
                  placeholder="esim. 8765"
                  required
                />
              </div>
              <div>
                <Label htmlFor="auth_token">Todennustunniste (valinnainen)</Label>
                <Input
                  id="auth_token"
                  type="password"
                  value={formData.auth_token}
                  onChange={(e) => setFormData({ ...formData, auth_token: e.target.value })}
                  placeholder="Syötä tunniste"
                />
              </div>
              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowForm(false);
                    setEditingProfile(null);
                    setFormData({ name: "", connection_type: "wifi", host: "", port: "", auth_token: "" });
                  }}
                  className="flex-1"
                >
                  Peruuta
                </Button>
                <Button type="submit" className="flex-1 bg-purple-600 hover:bg-purple-700">
                  {editingProfile ? 'Tallenna muutokset' : 'Luo profiili'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {connectionProfiles.profiles.map((profile) => (
          <Card key={profile.id} className={`glass-card border-2 ${profile.is_active ? 'border-green-400 shadow-xl' : 'border-purple-200 shadow-lg'}`}>
            <CardHeader className={`${profile.is_active ? 'bg-green-50 border-b border-green-200' : 'bg-purple-50 border-b border-purple-200'}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${profile.is_active ? 'bg-green-500' : 'bg-purple-500'}`}>
                    <Wifi className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{profile.name}</CardTitle>
                    <Badge variant={profile.is_active ? "default" : "secondary"} className="mt-1">
                      {profile.is_active ? <CheckCircle className="w-3 h-3 mr-1" /> : <XCircle className="w-3 h-3 mr-1" />}
                      {profile.is_active ? 'Aktiivinen' : 'Ei aktiivinen'}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="space-y-3 mb-4">
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-semibold text-gray-600">Host:</span>
                  <span className="font-mono text-purple-700">{profile.host}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-semibold text-gray-600">Port:</span>
                  <span className="font-mono text-purple-700">{profile.port}</span>
                </div>
                {profile.auth_token && (
                  <div className="flex items-center gap-2 text-sm">
                    <Shield className="w-4 h-4 text-gray-600" />
                    <span className="text-gray-600">Suojattu tunnuksella</span>
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                {!profile.is_active && (
                  <Button
                    onClick={() => handleConnect(profile.id)}
                    size="sm"
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    Yhdistä
                  </Button>
                )}
                <Button
                  onClick={() => handleEdit(profile)}
                  size="sm"
                  variant="outline"
                  className="flex-1"
                >
                  <Edit className="w-4 h-4 mr-1" />
                  Muokkaa
                </Button>
                <Button
                  onClick={() => handleDelete(profile.id)}
                  size="sm"
                  variant="destructive"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {connectionProfiles.profiles.length === 0 && !showForm && (
        <Card className="glass-card border-2 border-dashed border-purple-300">
          <CardContent className="pt-12 pb-12 text-center">
            <Wifi className="w-16 h-16 text-purple-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-700 mb-2">Ei yhteysprofiileja</h3>
            <p className="text-gray-600 mb-6">Luo ensimmäinen yhteysprofiilisi aloittaaksesi</p>
            <Button
              onClick={() => setShowForm(true)}
              className="bg-purple-600 hover:bg-purple-700"
            >
              <Plus className="w-5 h-5 mr-2" />
              Luo profiili
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
});