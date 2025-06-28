import { 
  WebSocketGateway, 
  WebSocketServer, 
  OnGatewayInit, 
  OnGatewayConnection, 
  OnGatewayDisconnect,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { UserRole } from '../../../generated/prisma';

@WebSocketGateway({ 
  namespace: '/dashboard', 
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true
  }
})
export class DashboardGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private connectedClients: Map<string, Socket> = new Map();

  afterInit() {
    console.log('Dashboard WebSocket Gateway initialized');
  }

  handleConnection(client: Socket) {
    console.log(`Client connected to dashboard: ${client.id}`);
    this.connectedClients.set(client.id, client);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected from dashboard: ${client.id}`);
    this.connectedClients.delete(client.id);
  }

  @SubscribeMessage('join-dashboard')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  handleJoinDashboard(
    @MessageBody() data: { userId: string },
    @ConnectedSocket() client: Socket
  ) {
    client.join('admin-dashboard');
    client.emit('dashboard-joined', { message: 'Successfully joined admin dashboard' });
    console.log(`Admin ${data.userId} joined dashboard`);
  }

  @SubscribeMessage('leave-dashboard')
  handleLeaveDashboard(@ConnectedSocket() client: Socket) {
    client.leave('admin-dashboard');
    client.emit('dashboard-left', { message: 'Left admin dashboard' });
  }

  // Emit methods for real-time updates
  emitMetricsUpdate(metrics: any) {
    this.server.to('admin-dashboard').emit('metrics-update', {
      type: 'metrics',
      data: metrics,
      timestamp: new Date().toISOString()
    });
  }

  emitRecentActivity(activity: any) {
    this.server.to('admin-dashboard').emit('recent-activity', {
      type: 'activity',
      data: activity,
      timestamp: new Date().toISOString()
    });
  }

  emitProjectApprovalUpdate(project: any) {
    this.server.to('admin-dashboard').emit('project-approval-update', {
      type: 'project-approval',
      data: project,
      timestamp: new Date().toISOString()
    });
  }

  emitUserUpdate(user: any) {
    this.server.to('admin-dashboard').emit('user-update', {
      type: 'user',
      data: user,
      timestamp: new Date().toISOString()
    });
  }

  emitSystemAlert(alert: any) {
    this.server.to('admin-dashboard').emit('system-alert', {
      type: 'system-alert',
      data: alert,
      timestamp: new Date().toISOString()
    });
  }

  emitContentUpdate(content: any) {
    this.server.to('admin-dashboard').emit('content-update', {
      type: 'content',
      data: content,
      timestamp: new Date().toISOString()
    });
  }

  // Broadcast to all connected clients
  broadcastToAll(event: string, data: any) {
    this.server.emit(event, {
      data,
      timestamp: new Date().toISOString()
    });
  }

  // Get connected clients count
  getConnectedClientsCount(): number {
    return this.connectedClients.size;
  }

  // Get connected clients info
  getConnectedClients(): string[] {
    return Array.from(this.connectedClients.keys());
  }
} 