# SNS Topic — the "notification channel" that sends emails
resource "aws_sns_topic" "alerts" {
  name = "${var.project_name}-alerts"
}

# Subscribe your email to the topic
resource "aws_sns_topic_subscription" "email" {
  topic_arn = aws_sns_topic.alerts.arn
  protocol  = "email"
  endpoint  = "aminebenzid2003@gmail.com"
}

# Alarm: CPU above 80% for 5 minutes
resource "aws_cloudwatch_metric_alarm" "cpu_high" {
  alarm_name          = "${var.project_name}-cpu-high"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 5
  metric_name         = "CPUUtilization"
  namespace           = "AWS/EC2"
  period              = 60
  statistic           = "Average"
  threshold           = 80
  alarm_description   = "EC2 CPU above 80% for 5 minutes"
  alarm_actions       = [aws_sns_topic.alerts.arn]
  ok_actions          = [aws_sns_topic.alerts.arn]

  dimensions = {
    InstanceId = aws_instance.backend.id
  }
}

# Alarm: backend has no status checks (instance crashed)
resource "aws_cloudwatch_metric_alarm" "instance_down" {
  alarm_name          = "${var.project_name}-instance-down"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 2
  metric_name         = "StatusCheckFailed"
  namespace           = "AWS/EC2"
  period              = 60
  statistic           = "Maximum"
  threshold           = 0
  alarm_description   = "EC2 instance failed status check — may be down"
  alarm_actions       = [aws_sns_topic.alerts.arn]

  dimensions = {
    InstanceId = aws_instance.backend.id
  }
}