import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Database, CheckCircle, XCircle, Settings, RefreshCw } from 'lucide-react';
import { apiCall } from '../../config/api';

export function DatabaseSetup() {
  const [status, setStatus] = useState<{
    tableExists: boolean;
    recordCount: number;
    message: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [setupResult, setSetupResult] = useState<string>('');

  const checkStatus = async () => {
    try {
      setIsLoading(true);
      const result = await apiCall('/setup/content-table-status');
      setStatus(result);
    } catch (error) {
      console.error('Error checking status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const setupTable = async () => {
    try {
      setIsLoading(true);
      const result = await apiCall('/setup/setup-content-table', {
        method: 'POST'
      });
      setSetupResult(result.message);
      // Refresh status after setup
      setTimeout(checkStatus, 1000);
    } catch (error) {
      console.error('Error setting up table:', error);
      setSetupResult(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    checkStatus();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Database Setup</h1>
        <p className="text-gray-400">Setup dan kelola database untuk SPH Content Management</p>
      </div>

      {/* Status Card */}
      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center space-x-2">
            <Database className="w-5 h-5" />
            <span>Status Database</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-300">SPH Content Table</span>
              {status ? (
                <Badge className={status.tableExists ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}>
                  {status.tableExists ? (
                    <><CheckCircle className="w-4 h-4 mr-1" /> Exists</>
                  ) : (
                    <><XCircle className="w-4 h-4 mr-1" /> Not Found</>
                  )}
                </Badge>
              ) : (
                <Badge className="bg-gray-500/20 text-gray-400">Checking...</Badge>
              )}
            </div>
            
            {status && status.tableExists && (
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Records Count</span>
                <Badge className="bg-blue-500/20 text-blue-400">
                  {status.recordCount} records
                </Badge>
              </div>
            )}
            
            <div className="flex space-x-2">
              <Button
                onClick={checkStatus}
                disabled={isLoading}
                variant="outline"
                className="border-gray-600 text-gray-300 hover:bg-gray-700"
              >
                {isLoading ? (
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4 mr-2" />
                )}
                Refresh Status
              </Button>
              
              {status && !status.tableExists && (
                <Button
                  onClick={setupTable}
                  disabled={isLoading}
                  className="bg-yellow-500 text-black hover:bg-yellow-600"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Setup Table & Data
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Setup Result */}
      {setupResult && (
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Setup Result</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-900 p-4 rounded-lg">
              <pre className="text-green-400 text-sm whitespace-pre-wrap">
                {setupResult}
              </pre>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Instructions */}
      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Instruksi</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-gray-300 space-y-3">
            <p><strong>1. Cek Status:</strong> Klik "Refresh Status" untuk melihat kondisi database</p>
            <p><strong>2. Setup Table:</strong> Jika table belum ada, klik "Setup Table & Data" untuk membuat tabel dan data default</p>
            <p><strong>3. Content Management:</strong> Setelah setup berhasil, gunakan menu "SPH Content" untuk edit konten</p>
            
            <div className="bg-yellow-500/10 border border-yellow-500/30 p-3 rounded-lg mt-4">
              <p className="text-yellow-400 text-sm">
                <strong>Note:</strong> Setup ini akan membuat tabel 'sph_content' dan mengisi data default untuk semua section (Hero, Tentang, Agenda, Pendaftaran).
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}