import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, UpdateDateColumn, CreateDateColumn, JoinColumn } from 'typeorm'
import { ScheduledTask } from './ScheduledTask'

@Entity()
export class Article {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(type => ScheduledTask, task => task.articles, {
      nullable: false
      // onDelete: 'CASCADE',
      // cascade: true
    })
    @JoinColumn()
    task: ScheduledTask;

    @Column({ nullable: false, length: '2047' })
    title: string;

    @Column({ nullable: false, length: '2047' })
    url: string;

    @UpdateDateColumn()
    readonly updatedAt?: Date;

    @CreateDateColumn()
    readonly createdAt?: Date;
}
