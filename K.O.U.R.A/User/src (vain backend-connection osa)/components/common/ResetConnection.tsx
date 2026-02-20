import React from 'react'
import { Card, CardContent } from '../ui/card'
import { Shield } from 'lucide-react'
import { Button } from '../ui/button'

const ResetConnection = (props: {error: string, callback: ()=> void}) => {
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="bg-white border-4 border-orange-600 max-w-2xl w-full shadow-2xl">
            <CardContent className="p-8">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-16 h-16 bg-orange-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <Shield className="w-10 h-10 text-white" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-orange-600 mb-2">Yhteysvirhe</h2>
                  <p className="text-gray-700 font-semibold">{props.error}</p>
                </div>
              </div>

              <div className="space-y-4 mb-6">
                <div className="p-4 bg-white rounded-lg border-2 border-purple-400">
                  <h4 className="font-bold text-purple-700 mb-2 flex items-center gap-2">
                    <span className="bg-purple-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm">1</span>
                    Varmista SSL/TLS
                  </h4>
                  <p className="text-sm text-gray-700">Raspberry Pi:n täytyy käyttää HTTPS:ää ja WebSocket Secure (wss://).</p>
                </div>
              </div>

              <div className="flex gap-4">
                <Button
                  onClick={props.callback}
                  size="lg"
                  variant="outline"
                  className="flex-1 border-gray-300 hover:bg-gray-100"
                >
                  Sulje
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
  )
}

export default ResetConnection