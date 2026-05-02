-- Enable Supabase Realtime for requests table so clients can subscribe to row changes
ALTER PUBLICATION supabase_realtime ADD TABLE public.requests;
