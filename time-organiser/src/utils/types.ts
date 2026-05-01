export interface User{
    id: string;
    userName: string;
    accessToke: string
    role: string;
}

export interface Hobbies{
    priority: string;
    title: string;
    occurence_per_week: string;
}

export interface Tasks{
    title: string;
    user_id: string;
    priority: string;
    status: string;
    due_date: Date;
    assignment_id: string;
}

export interface Assignments{
    title:string;
    user_id: string;
    status: string;
    priority: string;
    due_date: Date;
}

export interface Availability{
    user_id: string;
    start_time: Date;
    end_time: Date;

}

export interface Requests{
    user_id: string;
    partner_id: string;
}

export interface Friends{
    user_id: string;
    friend_id: string;
    status: string;
    friendship_time: Date | null;
}

export interface Goals{
    title: string;
    user_id: string;
    status: string;
    priority: string;
}